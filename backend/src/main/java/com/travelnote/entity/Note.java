package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Travel Note entity
 */
@Data
@TableName("note")
public class Note {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Note title
     */
    private String title;

    /**
     * Note content (text)
     */
    private String content;

    /**
     * Location information
     */
    private String location;

    /**
     * User ID (author)
     */
    private Long userId;

    /**
     * Likes count
     */
    private Integer likeCount;

    /**
     * Favorites count
     */
    private Integer favoriteCount;

    /**
     * Views count
     */
    private Integer viewCount;
    
    /**
     * Unique visitors count
     */
    private Integer uniqueViewCount;

    /**
     * Comments count
     */
    private Integer commentCount;

    /**
     * Status: 0-pending, 1-approved, 2-rejected
     */
    private Integer status;

    /**
     * Cover image URL
     */
    private String coverUrl;

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