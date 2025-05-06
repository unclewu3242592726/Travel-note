package com.travelnote.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.travelnote.common.constant.RedisKeyConstant;
import com.travelnote.entity.Note;
import com.travelnote.entity.NoteView;
import com.travelnote.mapper.NoteMapper;
import com.travelnote.mapper.NoteViewMapper;
import com.travelnote.service.StatsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class StatsServiceImpl implements StatsService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    
    @Autowired
    private NoteMapper noteMapper;
    
    @Autowired
    private NoteViewMapper noteViewMapper;
    
    @Override
    @Async
    public void recordNoteView(Long noteId, Long userId, HttpServletRequest request) {
        try {
            if (noteId == null) return;
            
            String ip = getIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            String identity = userId != null ? userId.toString() : ip;
            
            // 1. 增加浏览次数
            String statsKey = RedisKeyConstant.getNoteStatsKey(noteId);
            redisTemplate.opsForHash().increment(statsKey, RedisKeyConstant.VIEW_COUNT_FIELD, 1);
            
            // 2. 使用HyperLogLog记录唯一访客
            String uvKey = RedisKeyConstant.getNoteUvKey(noteId);
            stringRedisTemplate.opsForHyperLogLog().add(uvKey, identity);
            
            // 3. 异步记录浏览记录
            saveNoteView(noteId, userId, ip, userAgent);
        } catch (Exception e) {
            log.error("记录笔记浏览失败：noteId={}, userId={}", noteId, userId, e);
        }
    }

    @Override
    public void incrementLikeCount(Long noteId) {
        if (noteId == null) return;
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        redisTemplate.opsForHash().increment(key, RedisKeyConstant.LIKE_COUNT_FIELD, 1);
    }

    @Override
    public void decrementLikeCount(Long noteId) {
        if (noteId == null) return;
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        redisTemplate.opsForHash().increment(key, RedisKeyConstant.LIKE_COUNT_FIELD, -1);
    }

    @Override
    public void incrementFavoriteCount(Long noteId) {
        if (noteId == null) return;
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        redisTemplate.opsForHash().increment(key, RedisKeyConstant.FAVORITE_COUNT_FIELD, 1);
    }

    @Override
    public void decrementFavoriteCount(Long noteId) {
        if (noteId == null) return;
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        redisTemplate.opsForHash().increment(key, RedisKeyConstant.FAVORITE_COUNT_FIELD, -1);
    }

    @Override
    public void incrementCommentCount(Long noteId) {
        if (noteId == null) return;
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        redisTemplate.opsForHash().increment(key, RedisKeyConstant.COMMENT_COUNT_FIELD, 1);
    }

    @Override
    public Map<String, Integer> getNoteStats(Long noteId) {
        Map<String, Integer> result = new HashMap<>();
        if (noteId == null) return result;
        
        String key = RedisKeyConstant.getNoteStatsKey(noteId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
        
        // 从Redis获取统计数据
        Integer likeCount = getIntValue(entries, RedisKeyConstant.LIKE_COUNT_FIELD);
        Integer commentCount = getIntValue(entries, RedisKeyConstant.COMMENT_COUNT_FIELD);
        Integer favoriteCount = getIntValue(entries, RedisKeyConstant.FAVORITE_COUNT_FIELD);
        Integer viewCount = getIntValue(entries, RedisKeyConstant.VIEW_COUNT_FIELD);
        
        // 获取UV统计
        String uvKey = RedisKeyConstant.getNoteUvKey(noteId);
        Long uniqueViewCount = stringRedisTemplate.opsForHyperLogLog().size(uvKey);
        
        // 如果Redis中没有数据，从数据库获取
        if (likeCount == null || commentCount == null || favoriteCount == null || viewCount == null) {
            Note note = noteMapper.selectById(noteId);
            if (note != null) {
                if (likeCount == null) likeCount = note.getLikeCount();
                if (commentCount == null) commentCount = note.getCommentCount();
                if (favoriteCount == null) favoriteCount = note.getFavoriteCount();
                if (viewCount == null) viewCount = note.getViewCount();
                
                // 将数据库数据写入Redis缓存
                if (likeCount != null) redisTemplate.opsForHash().put(key, RedisKeyConstant.LIKE_COUNT_FIELD, likeCount);
                if (commentCount != null) redisTemplate.opsForHash().put(key, RedisKeyConstant.COMMENT_COUNT_FIELD, commentCount);
                if (favoriteCount != null) redisTemplate.opsForHash().put(key, RedisKeyConstant.FAVORITE_COUNT_FIELD, favoriteCount);
                if (viewCount != null) redisTemplate.opsForHash().put(key, RedisKeyConstant.VIEW_COUNT_FIELD, viewCount);
                
                if (uniqueViewCount == null || uniqueViewCount == 0) {
                    uniqueViewCount = (long) note.getUniqueViewCount();
                }
            }
        }
        
        // 组装结果
        result.put(RedisKeyConstant.LIKE_COUNT_FIELD, likeCount != null ? likeCount : 0);
        result.put(RedisKeyConstant.COMMENT_COUNT_FIELD, commentCount != null ? commentCount : 0);
        result.put(RedisKeyConstant.FAVORITE_COUNT_FIELD, favoriteCount != null ? favoriteCount : 0);
        result.put(RedisKeyConstant.VIEW_COUNT_FIELD, viewCount != null ? viewCount : 0);
        result.put(RedisKeyConstant.UNIQUE_VIEW_COUNT_FIELD, uniqueViewCount != null ? uniqueViewCount.intValue() : 0);
        
        return result;
    }

    @Override
    @Transactional
    public void syncStatsToDB(Long noteId) {
        if (noteId == null) return;
        
        try {
            Note note = noteMapper.selectById(noteId);
            if (note == null) return;
            
            // 获取Redis中的统计数据
            Map<String, Integer> stats = getNoteStats(noteId);
            
            // 更新数据库
            note.setLikeCount(stats.get(RedisKeyConstant.LIKE_COUNT_FIELD));
            note.setCommentCount(stats.get(RedisKeyConstant.COMMENT_COUNT_FIELD));
            note.setFavoriteCount(stats.get(RedisKeyConstant.FAVORITE_COUNT_FIELD));
            note.setViewCount(stats.get(RedisKeyConstant.VIEW_COUNT_FIELD));
            note.setUniqueViewCount(stats.get(RedisKeyConstant.UNIQUE_VIEW_COUNT_FIELD));
            note.setUpdateTime(LocalDateTime.now());
            
            noteMapper.updateById(note);
            log.info("同步笔记统计数据成功: noteId={}", noteId);
        } catch (Exception e) {
            log.error("同步笔记统计数据失败: noteId={}", noteId, e);
        }
    }

    @Override
    @Transactional
    public void syncAllStatsToDB() {
        try {
            // 获取所有笔记的statistics key
            Set<String> keys = redisTemplate.keys(RedisKeyConstant.NOTE_STATS_PREFIX + "*");
            if (keys == null || keys.isEmpty()) {
                log.info("没有需要同步的笔记统计数据");
                return;
            }
            
            // 逐个同步到数据库
            for (String key : keys) {
                try {
                    String noteIdStr = key.replace(RedisKeyConstant.NOTE_STATS_PREFIX, "");
                    Long noteId = Long.parseLong(noteIdStr);
                    syncStatsToDB(noteId);
                } catch (NumberFormatException e) {
                    log.error("解析笔记ID失败: key={}", key, e);
                }
            }
            
            log.info("同步所有笔记统计数据完成, 共同步{}条", keys.size());
        } catch (Exception e) {
            log.error("同步所有笔记统计数据失败", e);
        }
    }

    /**
     * 保存笔记浏览记录
     */
    @Async
    protected void saveNoteView(Long noteId, Long userId, String ip, String userAgent) {
        NoteView noteView = NoteView.builder()
                .noteId(noteId)
                .userId(userId)
                .ip(ip)
                .userAgent(userAgent)
                .viewTime(LocalDateTime.now())
                .build();
        
        noteViewMapper.insert(noteView);
    }

    /**
     * 获取请求的IP地址
     */
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // 多次反向代理后会有多个IP值，第一个为真实IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
    
    /**
     * 从Map中获取整数值
     */
    private Integer getIntValue(Map<Object, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        
        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof Long) {
            return ((Long) value).intValue();
        } else if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}