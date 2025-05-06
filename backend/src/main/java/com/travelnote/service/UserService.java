package com.travelnote.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.travelnote.dto.auth.RegisterRequest;
import com.travelnote.entity.User;

/**
 * User Service Interface
 */
public interface UserService extends IService<User> {

    /**
     * Find user by username
     *
     * @param username username
     * @return User
     */
    User findByUsername(String username);

    /**
     * Find user by email
     *
     * @param email email
     * @return User
     */
    User findByEmail(String email);

    /**
     * Find user by mobile
     *
     * @param mobile mobile
     * @return User
     */
    User findByMobile(String mobile);

    /**
     * Find user by username or email or mobile
     *
     * @param usernameOrEmailOrMobile username or email or mobile
     * @return User
     */
    User findByUsernameOrEmailOrMobile(String usernameOrEmailOrMobile);

    /**
     * Register new user
     *
     * @param registerRequest register request
     * @return User
     */
    User register(RegisterRequest registerRequest);

    /**
     * Update user status
     *
     * @param userId user ID
     * @param status status
     * @return boolean
     */
    boolean updateStatus(Long userId, Integer status);

    /**
     * 更新用户信息
     * @param user 用户对象
     * @return boolean
     */
    boolean updateUser(User user);

    /**
     * 根据用户ID获取用户信息
     * @param userId 用户ID
     * @return User
     */
    User getUserById(Long userId);


    /**
     * 根据用户ID获取用户信息
     * @param userId 用户ID
     * @return User
     */
    boolean changePassword(Long userId, String oldPassword, String newPassword) throws RuntimeException, Exception, NullPointerException;



    /**
     * 验证密码
     * @param userId 用户ID
     * @param password 密码
     * @throws Exception 异常
     */
    void validatePassword(Long userId, String password) throws Exception;
    

}