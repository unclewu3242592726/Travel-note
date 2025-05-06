package com.travelnote.controller;

import com.travelnote.dto.ResponseResult;
import com.travelnote.dto.auth.JwtResponse;
import com.travelnote.dto.auth.LoginRequest;
import com.travelnote.dto.auth.RefreshTokenRequest;
import com.travelnote.dto.auth.RegisterRequest;
import com.travelnote.exception.AccountStatusException;
import com.travelnote.exception.InvalidTokenException;
import com.travelnote.exception.RegistrationException;
import com.travelnote.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * Authentication Controller
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication API")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Value("${jwt.header}")
    private String tokenHeader;

    @Value("${jwt.tokenPrefix}")
    private String tokenPrefix;

    /**
     * Login
     */
    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseResult<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            return ResponseResult.success(authService.login(loginRequest));
        } catch (UsernameNotFoundException e) {
            logger.warn("Login failed: User not found - {}", e.getMessage());
            return ResponseResult.error(HttpStatus.NOT_FOUND.value(), "用户不存在");
        } catch (AccountStatusException e) {
            logger.warn("Login failed: Account status issue - {}", e.getMessage());
            return ResponseResult.error(HttpStatus.FORBIDDEN.value(), e.getMessage());
        } catch (BadCredentialsException e) {
            logger.warn("Login failed: Bad credentials for user {}", loginRequest.getUsername());
            return ResponseResult.error(HttpStatus.UNAUTHORIZED.value(), "用户名或密码错误");
        } catch (Exception e) {
            logger.error("Login failed with unexpected error", e);
            return ResponseResult.error("登录失败，请稍后重试");
        }
    }

    /**
     * Register
     */
    @PostMapping("/register")
    @Operation(summary = "User registration")
    public ResponseResult<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            return ResponseResult.success(authService.register(registerRequest));
        } catch (RegistrationException e) {
            logger.warn("Registration failed: {}", e.getMessage());
            
            // 如果是特定字段的错误（如用户名已存在），返回字段信息
            if (e.getField() != null) {
                return ResponseResult.error(HttpStatus.BAD_REQUEST.value(), e.getMessage(), e.getField());
            }
            
            return ResponseResult.error(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        } catch (Exception e) {
            logger.error("Registration failed with unexpected error", e);
            return ResponseResult.error("注册失败，请稍后重试");
        }
    }

    /**
     * Refresh token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public ResponseResult<JwtResponse> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            return ResponseResult.success(authService.refreshToken(request.getRefreshToken()));
        } catch (InvalidTokenException e) {
            logger.warn("Token refresh failed: Invalid token - {}", e.getMessage());
            return ResponseResult.error(HttpStatus.UNAUTHORIZED.value(), "无效或已过期的刷新令牌");
        } catch (AccountStatusException e) {
            logger.warn("Token refresh failed: Account status issue - {}", e.getMessage());
            return ResponseResult.error(HttpStatus.FORBIDDEN.value(), e.getMessage());
        } catch (Exception e) {
            logger.error("Token refresh failed with unexpected error", e);
            return ResponseResult.error("令牌刷新失败，请重新登录");
        }
    }

    /**
     * Logout
     */
    @PostMapping("/logout")
    @Operation(summary = "User logout")
    public ResponseResult<Void> logout(HttpServletRequest request, @RequestParam(required = false) String refreshToken) {
        try {
            // Get access token from header
            String bearerToken = request.getHeader(tokenHeader);
            String accessToken = null;

            if (bearerToken != null && bearerToken.startsWith(tokenPrefix)) {
                accessToken = bearerToken.substring(tokenPrefix.length());
            }

            authService.logout(accessToken, refreshToken);
            return ResponseResult.success();
        } catch (Exception e) {
            logger.error("Logout failed", e);
            // 即使登出失败，我们也返回成功，因为客户端已经要离开了
            return ResponseResult.success();
        }
    }
    
    /**
     * Get refresh token usage info
     */
    @GetMapping("/refresh-token/usage")
    @Operation(summary = "Get refresh token usage information")
    public ResponseResult<Integer> getRefreshTokenUsage(@RequestParam String refreshToken) {
        try {
            int remainingUsage = authService.getRefreshTokenRemainingUsage(refreshToken);
            return ResponseResult.success(remainingUsage);
        } catch (InvalidTokenException e) {
            logger.warn("Get token usage failed: Invalid token");
            return ResponseResult.error(HttpStatus.UNAUTHORIZED.value(), "无效或已过期的刷新令牌");
        } catch (Exception e) {
            logger.error("Get token usage failed with unexpected error", e);
            return ResponseResult.error("获取令牌信息失败");
        }
    }
}