package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Like entity
 */
@Data
@TableName("`like`")//解决sql关键字问题
public class Like {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * Travel note ID
     */
    private Long noteId;
    
    /**
     * User ID (who liked the note)
     */
    private Long userId;
    
    /**
     * Creation time
     */
    private LocalDateTime createTime;
} 