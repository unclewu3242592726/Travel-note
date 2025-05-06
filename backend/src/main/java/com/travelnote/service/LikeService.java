package com.travelnote.service;

public interface LikeService {
    boolean isLiked(Long userId, Long noteId);
    void like(Long userId, Long noteId);
    void unlike(Long userId, Long noteId);
}