package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Travel Note Media entity (images and videos)
 */
@Data
@TableName("note_media")
public class NoteMedia {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Travel note ID
     */
    private Long noteId;
    
    /**
     * Media URL
     */
    private String url;
    
    /**
     * Media type: 0-image, 1-video
     */
    private Integer type;
    
    /**
     * Media order in the note
     */
    private Integer ordering;
    
    /**
     * Creation time
     */
    private LocalDateTime createTime;
} 