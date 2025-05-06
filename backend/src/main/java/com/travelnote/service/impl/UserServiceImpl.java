package com.travelnote.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.travelnote.dto.auth.RegisterRequest;
import com.travelnote.entity.User;
import com.travelnote.mapper.UserMapper;
import com.travelnote.security.JwtTokenProvider;
import com.travelnote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * User Service Implementation
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public User findByMobile(String mobile) {
        return userMapper.findByMobile(mobile);
    }

    @Override
    public User findByUsernameOrEmailOrMobile(String usernameOrEmailOrMobile) {
        // Try to find by username
        User user = findByUsername(usernameOrEmailOrMobile);
        
        if (user == null) {
            // Try to find by email
            user = findByEmail(usernameOrEmailOrMobile);
        }
        
        if (user == null) {
            // Try to find by mobile
            user = findByMobile(usernameOrEmailOrMobile);
        }
        
        return user;
    }

    @Override
    @Transactional
    public User register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (findByUsername(registerRequest.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (findByEmail(registerRequest.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        
        // Check if mobile already exists
        if (registerRequest.getMobile() != null && findByMobile(registerRequest.getMobile()) != null) {
            throw new RuntimeException("Mobile already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setMobile(registerRequest.getMobile());
        user.setStatus(0); // 0-normal
        user.setType(0);   // 0-normal user
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        user.setDeleted(0); // 0-not deleted
        
        // Save user
        save(user);
        
        return user;
    }

    @Override
    @Transactional
    public boolean updateStatus(Long userId, Integer status) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        
        user.setStatus(status);
        user.setUpdateTime(LocalDateTime.now());
        
        boolean updated = updateById(user);
        
        // 如果用户被禁用，撤销所有令牌
        if (updated && status == 1) { // 1表示禁用状态
            tokenProvider.invalidateAllUserTokens(userId);
        }
        
        return updated;
    }

    @Override
    public boolean updateUser(User user) {
        user.setUpdateTime(java.time.LocalDateTime.now());
        // 只允许更新部分字段，防止覆盖敏感信息
        return this.updateById(user);
    }

    @Override
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    @Override
    @Transactional
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        
        boolean updated = updateById(user);
        
        // 密码更改成功后，使该用户的所有令牌失效
        if (updated) {
            tokenProvider.invalidateAllUserTokens(userId);
        }
        
        return updated;
    }

    @Override
    public void validatePassword(Long userId, String password) throws RuntimeException, Exception, NullPointerException {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
    }
    
}