package com.travelnote.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Login request DTO
 */
@Data
public class LoginRequest {

    /**
     * Username or email or mobile
     */
    @NotBlank(message = "Username cannot be blank")
    private String username;

    /**
     * Password
     */
    @NotBlank(message = "Password cannot be blank")
    private String password;
} 