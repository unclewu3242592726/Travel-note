package com.travelnote.service;

import com.travelnote.dto.auth.JwtResponse;
import com.travelnote.dto.auth.LoginRequest;
import com.travelnote.dto.auth.RegisterRequest;

/**
 * Auth Service Interface
 */
public interface AuthService {

    /**
     * Login with username/email/mobile and password
     *
     * @param loginRequest login request
     * @return JWT response
     */
    JwtResponse login(LoginRequest loginRequest);

    /**
     * Register new user
     *
     * @param registerRequest register request
     * @return JWT response
     */
    JwtResponse register(RegisterRequest registerRequest);

    /**
     * Refresh token
     *
     * @param refreshToken refresh token
     * @return JWT response with new tokens
     */
    JwtResponse refreshToken(String refreshToken);

    /**
     * Logout
     *
     * @param accessToken access token
     * @param refreshToken refresh token
     */
    void logout(String accessToken, String refreshToken);

    /**
     * 获取刷新令牌的剩余使用次数
     *
     * @param refreshToken 刷新令牌
     * @return 剩余可使用次数
     */
    int getRefreshTokenRemainingUsage(String refreshToken);
}