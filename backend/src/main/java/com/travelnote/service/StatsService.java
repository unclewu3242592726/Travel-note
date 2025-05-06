package com.travelnote.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 笔记统计服务接口
 */
public interface StatsService {
    
    /**
     * 记录笔记浏览
     */
    void recordNoteView(Long noteId, Long userId, HttpServletRequest request);
    
    /**
     * 增加笔记点赞数
     */
    void incrementLikeCount(Long noteId);
    
    /**
     * 减少笔记点赞数
     */
    void decrementLikeCount(Long noteId);
    
    /**
     * 增加笔记收藏数
     */
    void incrementFavoriteCount(Long noteId);
    
    /**
     * 减少笔记收藏数
     */
    void decrementFavoriteCount(Long noteId);
    
    /**
     * 增加笔记评论数
     */
    void incrementCommentCount(Long noteId);
    
    /**
     * 获取笔记统计数据
     */
    Map<String, Integer> getNoteStats(Long noteId);
    
    /**
     * 将缓存中的统计数据同步到数据库
     */
    void syncStatsToDB(Long noteId);
    
    /**
     * 同步所有笔记的统计数据
     */
    void syncAllStatsToDB();
}