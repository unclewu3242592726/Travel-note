package com.travelnote.service;

import java.util.List;
import java.util.Map;

import com.travelnote.dto.note.NoteResponse;

public interface FavoriteService {
    boolean isFavorited(Long userId, Long noteId);
    void favorite(Long userId, Long noteId);
    void unfavorite(Long userId, Long noteId);

    List<NoteResponse> getFavoriteNotesByUserId(Long userId);

    /**
     * 分页获取用户收藏的笔记
     */
    Map<String, Object> getFavoriteNotesByUserId(Long userId, int page, int size);
}