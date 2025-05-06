package com.travelnote.controller;

import com.travelnote.dto.ResponseResult;
import com.travelnote.security.JwtTokenProvider;
import com.travelnote.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin API")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UserService userService;

    /**
     * 强制登出指定用户
     */
    @PostMapping("/users/{userId}/logout")
    @Operation(summary = "强制用户登出", description = "管理员可以强制指定用户的所有会话登出")
    public ResponseResult<Void> forceUserLogout(@PathVariable Long userId) {
        // 验证用户是否存在
        if (userService.getUserById(userId) == null) {
            return ResponseResult.error("用户不存在");
        }
        
        // 使该用户的所有令牌失效
        tokenProvider.invalidateAllUserTokens(userId);
        
        return ResponseResult.success();
    }
}