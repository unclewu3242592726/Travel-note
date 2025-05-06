package com.travelnote.dto.note;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private String location;
    private String coverUrl;
    private Long userId;
    private String username;
    private String userAvatar;
    private int  status;

    // 统计数据
    private Integer viewCount;
    private Integer likeCount;
    private Integer favoriteCount;
    private Integer commentCount;
    
    // 用户交互状态
    private Boolean isLiked;
    private Boolean isFavorited;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // 为了兼容String类型时间的需求，可选添加
    private String createTimeStr;
}
