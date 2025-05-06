package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Comment entity
 */
@Data
@TableName("comment")
public class Comment {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Travel note ID
     */
    private Long noteId;
    
    /**
     * User ID (who made the comment)
     */
    private Long userId;
    
    /**
     * Comment content
     */
    private String content;
    
    /**
     * Parent comment ID (for reply feature, 0 if it's a top-level comment)
     */
    private Long parentId;
    
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
} 