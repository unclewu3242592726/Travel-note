package com.travelnote.common.constant;

/**
 * Redis键常量类
 */
public class RedisKeyConstant {
    
    // 笔记统计数据 Hash结构
    public static final String NOTE_STATS_PREFIX = "note:stats:";
    
    // 笔记详情缓存 Hash结构
    public static final String NOTE_CACHE_PREFIX = "note:cache:";
    
    // UV统计 HyperLogLog结构
    public static final String NOTE_UV_PREFIX = "note:uv:";
    
    // 注意点赞、收藏、评论统计字段
    public static final String LIKE_COUNT_FIELD = "like_count";
    public static final String COMMENT_COUNT_FIELD = "comment_count";
    public static final String FAVORITE_COUNT_FIELD = "favorite_count";
    public static final String VIEW_COUNT_FIELD = "view_count";
    public static final String UNIQUE_VIEW_COUNT_FIELD = "unique_view_count";

    /**
     * JWT令牌JTI前缀
     */
    public static final String JTI_PREFIX = "jwt:jti:";
    
    /**
     * 刷新令牌前缀
     */
    public static final String REFRESH_TOKEN_PREFIX = "jwt:refresh:";
    
    /**
     * 刷新令牌使用计数前缀
     */
    public static final String REFRESH_TOKEN_USAGE_PREFIX = "jwt:refresh:usage:";
    
    /**
     * 用户访问令牌集合前缀
     */
    public static final String USER_TOKEN_PREFIX = "jwt:user:tokens:";
    
    /**
     * 用户刷新令牌集合前缀
     */
    public static final String USER_REFRESH_TOKEN_PREFIX = "jwt:user:refresh_tokens:";

    /**
     * 获取笔记统计数据的key
     */
    public static String getNoteStatsKey(Long noteId) {
        return NOTE_STATS_PREFIX + noteId;
    }
    
    /**
     * 获取笔记缓存的key
     */
    public static String getNoteCacheKey(Long noteId) {
        return NOTE_CACHE_PREFIX + noteId;
    }
    
    /**
     * 获取笔记UV统计的key
     */
    public static String getNoteUvKey(Long noteId) {
        return NOTE_UV_PREFIX + noteId;
    }
}