package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Report entity
 */
@Data
@TableName("report")
public class Report {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Travel note ID
     */
    private Long noteId;
    
    /**
     * User ID (who reported the note)
     */
    private Long userId;
    
    /**
     * Report reason
     */
    private String reason;
    
    /**
     * Report status: 0-pending, 1-processed
     */
    private Integer status;
    
    /**
     * Processing result: 0-ignored, 1-note removed
     */
    private Integer result;
    
    /**
     * Creation time
     */
    private LocalDateTime createTime;
    
    /**
     * Processing time
     */
    private LocalDateTime processTime;
} 