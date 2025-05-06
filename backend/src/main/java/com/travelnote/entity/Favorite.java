package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Favorite entity
 */
@Data
@TableName("favorite")
public class Favorite {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Travel note ID
     */
    private Long noteId;
    
    /**
     * User ID (who favorited the note)
     */
    private Long userId;
    
    /**
     * Creation time
     */
    private LocalDateTime createTime;
} 