package com.travelnote.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travelnote.dto.note.NoteResponse;
import com.travelnote.entity.Favorite;
import com.travelnote.entity.Note;
import com.travelnote.mapper.FavoriteMapper;
import com.travelnote.mapper.NoteMapper;
import com.travelnote.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FavoriteServiceImpl implements FavoriteService {
    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private NoteMapper noteMapper;

    @Override
    public boolean isFavorited(Long userId, Long noteId) {
        return favoriteMapper.selectCount(
            new QueryWrapper<Favorite>().eq("user_id", userId).eq("note_id", noteId)
        ) > 0;
    }
    
    @Override
    public void favorite(Long userId, Long noteId) {
        if (!isFavorited(userId, noteId)) {
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setNoteId(noteId);
            fav.setCreateTime(LocalDateTime.now());
            favoriteMapper.insert(fav);
            // 可选：noteMapper.updateFavoriteCount(noteId, 1);
        }
    }
    
    @Override
    public void unfavorite(Long userId, Long noteId) {
        favoriteMapper.delete(
            new QueryWrapper<Favorite>().eq("user_id", userId).eq("note_id", noteId)
        );
        // 可选：noteMapper.updateFavoriteCount(noteId, -1);
    }

    @Override
    public List<NoteResponse> getFavoriteNotesByUserId(Long userId) {
        List<Favorite> favorites = favoriteMapper.selectList(
            new QueryWrapper<Favorite>().eq("user_id", userId)
        );
        List<Long> noteIds = favorites.stream().map(Favorite::getNoteId).collect(Collectors.toList());
        if (noteIds.isEmpty()) return List.of();
        List<Note> notes = noteMapper.selectBatchIds(noteIds);
        return notes.stream().map(note -> {
            NoteResponse resp = new NoteResponse();
            org.springframework.beans.BeanUtils.copyProperties(note, resp);
            return resp;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFavoriteNotesByUserId(Long userId, int page, int size) {
        Page<Favorite> pageInfo = new Page<>(page, size);
        IPage<Favorite> pagedFavorites = favoriteMapper.selectPage(pageInfo,
                new QueryWrapper<Favorite>().eq("user_id", userId));
        List<Long> noteIds = pagedFavorites.getRecords().stream().map(Favorite::getNoteId).collect(Collectors.toList());
        List<Note> notes = noteIds.isEmpty() ? List.of() : noteMapper.selectBatchIds(noteIds);
        List<NoteResponse> noteResponses = notes.stream().map(note -> {
            NoteResponse resp = new NoteResponse();
            org.springframework.beans.BeanUtils.copyProperties(note, resp);
            return resp;
        }).collect(Collectors.toList());
        Map<String, Object> result = new HashMap<>();
        result.put("content", noteResponses);
        result.put("totalElements", pagedFavorites.getTotal());
        result.put("page", pagedFavorites.getCurrent());
        result.put("size", pagedFavorites.getSize());
        return result;
    }
}
