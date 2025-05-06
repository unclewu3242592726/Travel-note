package com.travelnote.service;

import com.travelnote.dto.comment.CommentRequest;
import com.travelnote.dto.comment.CommentResponse;

import java.util.List;

public interface CommentService {
    List<CommentResponse> getCommentsByNoteId(Long noteId);
    void addComment(Long userId, Long noteId, String content);
}
