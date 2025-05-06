package com.travelnote.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * JWT authentication response DTO
 */
@Data
@AllArgsConstructor
public class JwtResponse {

    /**
     * Access token
     */
    private String accessToken;
    
    /**
     * Refresh token
     */
    private String refreshToken;
    
    /**
     * User ID
     */
    private Long userId;
    
    /**
     * Username
     */
    private String username;
    
    /**
     * Email
     */
    private String email;
    
    /**
     * User type: 0-normal user, 1-admin
     */
    private Integer userType;
} 