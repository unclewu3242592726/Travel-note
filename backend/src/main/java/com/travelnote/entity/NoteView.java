package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("note_view")
public class NoteView {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("note_id")
    private Long noteId;
    
    @TableField("user_id")
    private Long userId;
    
    private String ip;
    
    @TableField("user_agent")
    private String userAgent;
    
    @TableField("view_time")
    private LocalDateTime viewTime;
}