package com.travelnote.service.impl;

import com.travelnote.dto.auth.JwtResponse;
import com.travelnote.dto.auth.LoginRequest;
import com.travelnote.dto.auth.RegisterRequest;
import com.travelnote.entity.User;
import com.travelnote.exception.AccountStatusException;
import com.travelnote.exception.InvalidTokenException;
import com.travelnote.exception.RegistrationException;
import com.travelnote.security.CustomUserDetails;
import com.travelnote.security.JwtTokenProvider;
import com.travelnote.service.AuthService;
import com.travelnote.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Auth Service Implementation
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        // Find the user to get the user type information
        User user = userService.findByUsernameOrEmailOrMobile(loginRequest.getUsername());
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username/email/mobile: " + loginRequest.getUsername());
        }
        
        // Check if user is banned
        if (user.getStatus() == 1) {
            throw new AccountStatusException("Account has been banned", user.getStatus());
        }
        
        // Authenticate with Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Set authentication in context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT tokens
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Return JWT response
        return new JwtResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getType()
        );
    }

    @Override
    public JwtResponse register(RegisterRequest registerRequest) {
        // 第一步：注册用户
        User user;
        try {
            user = userService.register(registerRequest);
            logger.info("User registered successfully: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("User registration failed: {}", e.getMessage(), e);
            throw new RegistrationException(e.getMessage());
        }
        
        // 第二步：登录用户（生成令牌）
        try {
            // 使用新注册的用户信息创建登录请求
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(user.getUsername());
            loginRequest.setPassword(registerRequest.getPassword()); // 使用原始未加密密码
            
            // 调用登录方法生成令牌
            return login(loginRequest);
        } catch (Exception e) {
            logger.error("Authentication failed after registration for user {}: {}", 
                    user.getUsername(), e.getMessage(), e);
            throw new RegistrationException("Registration successful, but automatic login failed. Please try logging in manually.");
        }
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        // Validate refresh token
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }
        
        // 获取刷新令牌中的用户信息
        String username = tokenProvider.getUsernameFromToken(refreshToken);
        
        // 查找用户
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        
        // 检查用户状态
        if (user.getStatus() == 1) {
            // 用户已被禁用，撤销所有令牌
            tokenProvider.invalidateAllUserTokens(user.getId());
            throw new AccountStatusException("Account has been banned", user.getStatus());
        }
        
        // 创建认证对象用于生成令牌
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        if (user.getType() == 1) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        
        // 使用CustomUserDetails而不是标准User
        CustomUserDetails userDetails = new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                authorities
        );
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        
        try {
            // 生成新令牌
            String newAccessToken = tokenProvider.generateToken(authentication);
            int chainDepth = tokenProvider.getChainDepthFromToken(refreshToken);
            String newRefreshToken = tokenProvider.generateRefreshToken(authentication,chainDepth+1);
            
            // 成功生成新令牌后，再增加原刷新令牌的使用计数
            tokenProvider.incrementRefreshTokenUsage(refreshToken);
            
            // 返回新令牌
            return new JwtResponse(
                    newAccessToken,
                    newRefreshToken,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getType()
            );
        } finally {
            // 如果生成过程中发生任何错误，原刷新令牌会保持不变
        }
    }

    @Override
    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null) {
            tokenProvider.invalidateToken(accessToken);
        }
        
        if (refreshToken != null) {
            tokenProvider.invalidateRefreshToken(refreshToken);
        }
    }

    @Override
    public int getRefreshTokenRemainingUsage(String refreshToken) {
        return tokenProvider.getRefreshTokenRemainingUsage(refreshToken);
    }
}