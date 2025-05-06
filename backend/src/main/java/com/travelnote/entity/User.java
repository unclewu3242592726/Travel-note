package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * User entity
 */
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Username
     */
    private String username;
    
    /**
     * Password
     */
    private String password;
    
    /**
     * Email
     */
    private String email;
    
    /**
     * Mobile phone number
     */
    private String mobile;
    
    /**
     * User avatar URL
     */
    private String avatar;
    
    /**
     * User introduction
     */
    private String introduction;
    
    /**
     * User status: 0-normal, 1-banned
     */
    private Integer status;
    
    /**
     * User type: 0-normal user, 1-admin
     */
    private Integer type;
    
    /**
     * Creation time
     */
    private LocalDateTime createTime;
    
    /**
     * Update time
     */
    private LocalDateTime updateTime;
    
    /**
     * Logical delete flag: 0-not deleted, 1-deleted
     */
    @TableLogic
    private Integer deleted;

    public String getRoles() {
        if (type == 1) {
            return "ROLE_ADMIN";
        } else if (type == 2) {
            return "ROLE_SUPER_ADMIN";
        } else {
            return "ROLE_USER"; // 默认普通用户
        }
    }
} 