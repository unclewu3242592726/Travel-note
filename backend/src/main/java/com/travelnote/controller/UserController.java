package com.travelnote.controller;

import com.travelnote.common.util.SecurityUtils;
import com.travelnote.dto.ResponseResult;
import com.travelnote.dto.note.NoteResponse;
import com.travelnote.dto.user.ChangePasswordRequest;
import com.travelnote.dto.user.UserProfileResponse;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.travelnote.service.UserService;
import com.travelnote.service.FavoriteService;
import com.travelnote.entity.User;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private FavoriteService favoriteService;

    @PutMapping("/profile")
    public ResponseResult<Void> updateUser(@RequestBody User user) {

        Long userId = SecurityUtils.getCurrentUserId();
        user.setId(userId);
        userService.updateUser(user);
        return ResponseResult.success();
    }

    @PostMapping("/change-password")
    public ResponseResult<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseResult.error("未登录或token无效");
        }

        if (request.getOldPassword() == null || request.getNewPassword() == null) {
            return ResponseResult.error("旧密码或新密码不能为空");
        }
        if (request.getOldPassword().equals(request.getNewPassword())) {
            return ResponseResult.error("新密码不能与旧密码相同");
        }
        try {
            userService.validatePassword(userId, request.getOldPassword());
        } catch (Exception e) {
            return ResponseResult.error("旧密码错误");
        }
        try
        {
            userService.changePassword(userId, request.getOldPassword(),request.getNewPassword());
            
        } catch (Exception e) {
            return ResponseResult.error("密码更新失败");
        }
    
        return ResponseResult.success();

      
    }

    @GetMapping("/favorites")
    public ResponseResult<List<NoteResponse>> getFavoriteNotes(){
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseResult.error("未登录或token无效");
        }
        List<NoteResponse> notes = favoriteService.getFavoriteNotesByUserId(userId);
        return ResponseResult.success(notes);
    }

    //查询用户
    @GetMapping("/profile")
    public ResponseResult<UserProfileResponse> getProfile(){
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseResult.error("未登录或token无效");
        }
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseResult.error("用户不存在");
        }
        UserProfileResponse userProfile = new UserProfileResponse();
        userProfile.setUsername(user.getUsername());
        userProfile.setEmail(user.getEmail());
        userProfile.setAvatar(user.getAvatar());
        userProfile.setMobile(user.getMobile());
        userProfile.setAvatar(user.getAvatar());
        userProfile.setIntroduction(user.getIntroduction());


        return ResponseResult.success(userProfile);


    }
}
