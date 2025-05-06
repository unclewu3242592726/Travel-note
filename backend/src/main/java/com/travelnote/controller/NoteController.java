package com.travelnote.controller;

import com.travelnote.dto.ResponseResult;
import com.travelnote.dto.comment.CommentRequest;
import com.travelnote.dto.comment.CommentResponse;
import com.travelnote.dto.note.NoteDetailResponse;
import com.travelnote.dto.note.NoteRequest;
import com.travelnote.dto.note.NoteResponse;
import com.travelnote.service.NoteService;
import com.travelnote.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import com.travelnote.common.util.SecurityUtils;
import com.travelnote.service.CommentService;
import com.travelnote.service.FavoriteService;
import com.travelnote.service.LikeService;

@RestController
@RequestMapping("/notes")
@Tag(name = "笔记管理接口")
public class NoteController {

    @Autowired
    private NoteService noteService;
    @Autowired
    private LikeService likeService;
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private CommentService commentService;
    @Autowired
    private StatsService statsService;

    @PostMapping
    @Operation(summary = "创建笔记")
    public ResponseResult<NoteResponse> createNote(@Valid @RequestBody NoteRequest noteRequest) {
        return ResponseResult.success(noteService.createNote(noteRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取笔记详情")
    public ResponseResult<NoteDetailResponse> getNoteById(@PathVariable Long id, HttpServletRequest request) {
        // 记录浏览
        Long userId = SecurityUtils.getCurrentUserId();
        statsService.recordNoteView(id, userId, request);
        
        return ResponseResult.success(noteService.getNoteDetailById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新笔记")
    public ResponseResult<NoteDetailResponse> updateNote(@PathVariable Long id, @Valid @RequestBody NoteRequest noteRequest) {
        return ResponseResult.success(noteService.updateNote(id, noteRequest));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除笔记")
    public ResponseResult<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseResult.success();
    }

    @GetMapping
    @Operation(summary = "获取笔记列表")
    public ResponseResult<Map<String, Object>> getNotes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search) {
        return ResponseResult.success(noteService.getNotes(page, size, search));
    }

    @GetMapping("/users/notes")
    @Operation(summary = "获取当前用户的笔记列表")
    public ResponseResult<Map<String, Object>> getCurrentUserNotes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseResult.error("未登录或token无效");
        }
        return ResponseResult.success(noteService.getNotesByUserId(userId, page, size));
    }

    // 1. 是否点赞
    @GetMapping("/{id}/is-liked")
    public ResponseResult<Boolean> isLiked(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return ResponseResult.success(false);
        return ResponseResult.success(likeService.isLiked(userId, id));
    }

    // 2. 点赞
    @PostMapping("/{id}/like")
    public ResponseResult<Void> like(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        likeService.like(userId, id);
        // 更新统计数据
        statsService.incrementLikeCount(id);
        return ResponseResult.success();
    }

    // 3. 取消点赞
    @DeleteMapping("/{id}/like")
    public ResponseResult<Void> unlike(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        likeService.unlike(userId, id);
        // 更新统计数据
        statsService.decrementLikeCount(id);
        return ResponseResult.success();
    }

    // 4. 是否收藏
    @GetMapping("/{id}/is-favorited")
    public ResponseResult<Boolean> isFavorited(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return ResponseResult.success(false);
        return ResponseResult.success(favoriteService.isFavorited(userId, id));
    }

    // 5. 收藏
    @PostMapping("/{id}/favorite")
    public ResponseResult<Void> favorite(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.favorite(userId, id);
        // 更新统计数据
        statsService.incrementFavoriteCount(id);
        return ResponseResult.success();
    }

    // 6. 取消收藏
    @DeleteMapping("/{id}/favorite")
    public ResponseResult<Void> unfavorite(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.unfavorite(userId, id);
        // 更新统计数据
        statsService.decrementFavoriteCount(id);
        return ResponseResult.success();
    }

    // 7. 获取评论列表
    @GetMapping("/{id}/comments")
    public ResponseResult<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseResult.success(commentService.getCommentsByNoteId(id));
    }

    // 8. 发表评论
    @PostMapping("/{id}/comments")
    public ResponseResult<Void> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        commentService.addComment(userId, id, request.getContent());
        // 更新统计数据
        statsService.incrementCommentCount(id);
        return ResponseResult.success();
    }
    
    // 9. 获取笔记统计数据
    @GetMapping("/{id}/stats")
    @Operation(summary = "获取笔记统计数据")
    public ResponseResult<Map<String, Integer>> getNoteStats(@PathVariable Long id) {
        return ResponseResult.success(statsService.getNoteStats(id));
    }
    
    // 10. 手动同步笔记统计数据到数据库（仅管理员可用）
    @PostMapping("/{id}/sync-stats")
    @Operation(summary = "手动同步笔记统计数据到数据库")
    public ResponseResult<Void> syncNoteStats(@PathVariable Long id) {
        statsService.syncStatsToDB(id);
        return ResponseResult.success();
    }
}
