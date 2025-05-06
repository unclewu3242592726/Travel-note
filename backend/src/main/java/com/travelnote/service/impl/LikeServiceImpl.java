package com.travelnote.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.travelnote.entity.Like;
import com.travelnote.mapper.LikeMapper;
import com.travelnote.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LikeServiceImpl implements LikeService {
    @Autowired
    private LikeMapper likeMapper;

    @Override
    public boolean isLiked(Long userId, Long noteId) {
        return likeMapper.selectCount(
            new QueryWrapper<Like>().eq("user_id", userId).eq("note_id", noteId)
        ) > 0;
    }
    @Override
    public void like(Long userId, Long noteId) {
        if (!isLiked(userId, noteId)) {
            Like like = new Like();
            like.setUserId(userId);
            like.setNoteId(noteId);
            like.setCreateTime(LocalDateTime.now());
            likeMapper.insert(like);
            // 可选：noteMapper.updateLikeCount(noteId, 1);
        }
    }
    
    @Override
    public void unlike(Long userId, Long noteId) {
        likeMapper.delete(
            new QueryWrapper<Like>().eq("user_id", userId).eq("note_id", noteId)
        );
        // 可选：noteMapper.updateLikeCount(noteId, -1);
    }

}
