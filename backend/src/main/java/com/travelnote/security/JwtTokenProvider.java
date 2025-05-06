package com.travelnote.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.travelnote.exception.InvalidTokenException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.travelnote.common.constant.RedisKeyConstant.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refreshExpiration}")
    private long refreshExpirationMs;
    
    @Value("${jwt.refreshMaxUsage:10}")
    private int refreshMaxUsage;
    
    @Value("${jwt.refreshChainLimit:3}")
    private int refreshChainLimit; // 刷新令牌链最大深度，防止无限刷新

    private final StringRedisTemplate redisTemplate;

    private SecretKey key;
    
    // 使用Caffeine缓存实现令牌黑名单，具有TTL和最大容量控制
    private final Cache<String, Boolean> tokenBlacklist = Caffeine.newBuilder()
            .maximumSize(10000)                   // 最多缓存10000个令牌
            .expireAfterWrite(24, TimeUnit.HOURS) // 令牌在黑名单中保留24小时
            .build();
            
    private final Cache<String, Boolean> refreshTokenBlacklist = Caffeine.newBuilder()
            .maximumSize(5000)                      // 最多缓存5000个刷新令牌
            .expireAfterWrite(7, TimeUnit.DAYS)     // 刷新令牌在黑名单中保留7天
            .build();

    public JwtTokenProvider(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalArgumentException("JWT secret key must not be null or empty");
        }
        key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        String jti = UUID.randomUUID().toString();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", userPrincipal.getUsername());
        claims.put("userId", userPrincipal.getUserId());
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        claims.put("roles", roles);

        // 保存 JTI 到 Redis（设置过期时间）
        redisTemplate.opsForValue().set(JTI_PREFIX+jti, userPrincipal.getUsername(), jwtExpirationMs, TimeUnit.MILLISECONDS);
        
        // 同时在用户ID与token的映射中保存
        redisTemplate.opsForSet().add(USER_TOKEN_PREFIX + userPrincipal.getUserId(), jti);

        return Jwts.builder()
                .claims(claims)
                .id(jti)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }
    
    public String generateRefreshToken(Authentication authentication) {

        return generateRefreshToken(authentication, 0);
    } 
    
    /**
     * 生成刷新令牌，包含链深度信息
     * @param authentication 认证信息
     * @param chainDepth 刷新链深度
     * @return 刷新令牌
     */
    public String generateRefreshToken(Authentication authentication, int chainDepth) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        String jti = UUID.randomUUID().toString();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationMs);
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", userPrincipal.getUsername());
        claims.put("userId", userPrincipal.getUserId());
        // 添加刷新链深度信息，用于限制链长度
        claims.put("chainDepth", chainDepth);
        
        // 保存刷新令牌到Redis并设置过期时间
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + jti, userPrincipal.getUsername(), refreshExpirationMs, TimeUnit.MILLISECONDS);
        
        // 保存刷新令牌与用户ID的映射
        redisTemplate.opsForSet().add(USER_REFRESH_TOKEN_PREFIX + userPrincipal.getUserId(), jti);
        
        // 初始化刷新令牌使用计数为0
        redisTemplate.opsForValue().set(REFRESH_TOKEN_USAGE_PREFIX + jti, "0", refreshExpirationMs, TimeUnit.MILLISECONDS);

        return Jwts.builder()
                .id(jti)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String username = claims.get("username", String.class);
        Long userId = claims.get("userId", Long.class);

        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        List<GrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        CustomUserDetails principal = new CustomUserDetails(userId,username, "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            String jti = getJtiFromToken(token);
            // 检查令牌是否在Redis中有效，并且不在黑名单中
            return redisTemplate.hasKey(JTI_PREFIX+jti) && tokenBlacklist.getIfPresent(token) == null;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String jti = claims.getId();
            
            // 检查刷新令牌是否存在于Redis中
            boolean exists = redisTemplate.hasKey(REFRESH_TOKEN_PREFIX + jti);
            if (!exists) {
                return false;
            }
            
            // 检查刷新令牌是否在黑名单中
            if (refreshTokenBlacklist.getIfPresent(token) != null) {
                return false;
            }
            
            // 检查刷新链深度是否超过限制
            Integer chainDepth = claims.get("chainDepth", Integer.class);
            if (chainDepth != null && chainDepth >= refreshChainLimit) {
                log.warn("Refresh token chain depth ({}) exceeded limit ({})", chainDepth, refreshChainLimit);
                return false;
            }
            
            // 检查刷新令牌使用次数是否超过最大限制
            String usageCountStr = redisTemplate.opsForValue().get(REFRESH_TOKEN_USAGE_PREFIX + jti);
            if (usageCountStr != null) {
                int usageCount = Integer.parseInt(usageCountStr);
                return usageCount < refreshMaxUsage;
            }
            
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public void incrementRefreshTokenUsage(String token) {
        String jti = getJtiFromToken(token);
        redisTemplate.opsForValue().increment(REFRESH_TOKEN_USAGE_PREFIX + jti);
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("username", String.class);
    }
    
    public Long getUserIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", Long.class);
    }

    public void invalidateToken(String token) {
        String jti = getJtiFromToken(token);
        // 从JTI索引中删除
        redisTemplate.delete(JTI_PREFIX+jti);
        
        try {
            // 尝试从用户token集合中也删除这个token的jti
            Long userId = getUserIdFromToken(token);
            if (userId != null) {
                redisTemplate.opsForSet().remove(USER_TOKEN_PREFIX + userId, jti);
            }
        } catch (Exception e) {
            log.warn("Token cleanup parse error: {}", e.getMessage());
            // 令牌可能已过期无法解析userId，忽略异常
        }
        
        // 添加到黑名单缓存中
        tokenBlacklist.put(token, Boolean.TRUE);
    }

    public void invalidateRefreshToken(String token) {
        String jti = getJtiFromToken(token);
        // 删除刷新令牌
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + jti);
        // 删除使用计数
        redisTemplate.delete(REFRESH_TOKEN_USAGE_PREFIX + jti);
        
        try {
            // 从用户刷新令牌集合中移除
            Long userId = getUserIdFromToken(token);
            if (userId != null) {
                redisTemplate.opsForSet().remove(USER_REFRESH_TOKEN_PREFIX + userId, jti);
            }
        } catch (Exception e) {
            // 令牌可能已过期无法解析，忽略异常
        }
        
        // 添加到刷新令牌黑名单缓存中
        refreshTokenBlacklist.put(token, Boolean.TRUE);
    }
    
    /**
     * 使用户的所有令牌失效
     * 
     * @param userId 用户ID
     */
    public void invalidateAllUserTokens(Long userId) {
        // 获取用户的所有访问令牌ID
        Set<String> accessTokenJtis = redisTemplate.opsForSet().members(USER_TOKEN_PREFIX + userId);
        if (accessTokenJtis != null) {
            for (String jti : accessTokenJtis) {
                redisTemplate.delete(JTI_PREFIX + jti);
            }
        }
        // 清空用户的令牌集合
        redisTemplate.delete(USER_TOKEN_PREFIX + userId);
        
        // 获取用户的所有刷新令牌ID
        Set<String> refreshTokenJtis = redisTemplate.opsForSet().members(USER_REFRESH_TOKEN_PREFIX + userId);
        if (refreshTokenJtis != null) {
            for (String jti : refreshTokenJtis) {
                redisTemplate.delete(REFRESH_TOKEN_PREFIX + jti);
                redisTemplate.delete(REFRESH_TOKEN_USAGE_PREFIX + jti);
            }
        }
        // 清空用户的刷新令牌集合
        redisTemplate.delete(USER_REFRESH_TOKEN_PREFIX + userId);
    }

    private String getJtiFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getId();
    }
    
    /**
     * 获取刷新令牌的当前使用次数
     * @param token 刷新令牌
     * @return 当前使用次数
     */
    public int getRefreshTokenUsage(String token) throws InvalidTokenException {
        if (!validateRefreshToken(token)) {
            throw new InvalidTokenException("Invalid refresh token");
        }
        
        String jti = getJtiFromToken(token);
        String usageCountStr = redisTemplate.opsForValue().get(REFRESH_TOKEN_USAGE_PREFIX + jti);
        
        if (usageCountStr == null) {
            return 0;
        }
        
        try {
            return Integer.parseInt(usageCountStr);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    /**
     * 获取刷新令牌的剩余可使用次数
     * @param token 刷新令牌
     * @return 剩余可使用次数
     */
    public int getRefreshTokenRemainingUsage(String token) throws InvalidTokenException {
        int currentUsage = getRefreshTokenUsage(token);
        return Math.max(0, refreshMaxUsage - currentUsage);
    }
    
    /**
     * 检查令牌是否在黑名单中
     * @param token 令牌
     * @return 是否在黑名单中
     */
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.getIfPresent(token) != null;
    }
    
    /**
     * 检查刷新令牌是否在黑名单中
     * @param token 刷新令牌
     * @return 是否在黑名单中
     */
    public boolean isRefreshTokenBlacklisted(String token) {
        return refreshTokenBlacklist.getIfPresent(token) != null;
    }
    
    /**
     * 从刷新令牌中获取链深度
     * @param token 刷新令牌
     * @return 链深度
     */
    public int getChainDepthFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            Integer chainDepth = claims.get("chainDepth", Integer.class);
            return chainDepth != null ? chainDepth : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}