package com.travelnote.dto.comment;

import lombok.Getter;

@Getter
public class CommentResponse {
    private Long id;
    private Long userId;
    private String username;
    private String avatar;
    private String content;
    private String createTime;

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }
}
