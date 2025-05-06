package com.travelnote.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travelnote.common.util.SecurityUtils;
import com.travelnote.dto.note.NoteDetailResponse;
import com.travelnote.dto.note.NoteRequest;
import com.travelnote.dto.note.NoteResponse;
import com.travelnote.entity.Note;
import com.travelnote.entity.User;
import com.travelnote.exception.ResourceNotFoundException;
import com.travelnote.mapper.NoteMapper;
import com.travelnote.mapper.UserMapper;
import com.travelnote.service.NoteService;
import com.travelnote.service.LikeService;
import com.travelnote.service.FavoriteService;
import com.travelnote.entity.NoteMedia;
import com.travelnote.mapper.NoteMediaMapper;
import com.travelnote.dto.noteMedia.NoteMediaDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.print.attribute.standard.Media;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteMapper noteMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LikeService likeService;

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private NoteMediaMapper noteMediaMapper;

    @Override
    public NoteResponse createNote(NoteRequest request) {
        Note note = new Note();
        BeanUtils.copyProperties(request, note);
        
        LocalDateTime now = LocalDateTime.now();
        Long userId = SecurityUtils.getCurrentUserId();
        note.setUserId(userId);
        note.setCreateTime(now);
        note.setUpdateTime(now);
        note.setStatus(1);
        
        noteMapper.insert(note);

        // 新增：保存媒体文件到 note_media 表
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            for (NoteMediaDTO mediaDto : request.getMedia()) {
                NoteMedia media = new NoteMedia();
                media.setNoteId(note.getId());
                media.setUrl(mediaDto.getUrl());
                media.setType(mediaDto.getType());
                media.setOrdering(mediaDto.getOrdering());
                media.setCreateTime(now);
                noteMediaMapper.insert(media);
            }
        }
        
        NoteResponse response = new NoteResponse();
        BeanUtils.copyProperties(note, response);
        return response;
    }

    @Override
    public NoteResponse getNoteById(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new ResourceNotFoundException("笔记不存在");
        }
        
        NoteResponse response = new NoteResponse();
        BeanUtils.copyProperties(note, response);
        // 查询作者信息
        User user = userMapper.selectById(note.getUserId());
        if (user != null) {
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setUserAvatar(user.getAvatar());
        }
        return response;
    }

    @Override
    public NoteDetailResponse getNoteDetailById(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new ResourceNotFoundException("笔记不存在");
        }
        
        NoteDetailResponse response = new NoteDetailResponse();
        BeanUtils.copyProperties(note, response);
        
        // 查询作者信息
        User user = userMapper.selectById(note.getUserId());
        if (user != null) {
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setUserAvatar(user.getAvatar());
        }
        
        // 查询媒体文件
        List<NoteMedia> mediaList = noteMediaMapper.selectList(new QueryWrapper<NoteMedia>().eq("note_id", id));
        List<NoteMediaDTO> mediaDTOs = mediaList.stream().map(media -> {
            NoteMediaDTO dto = new NoteMediaDTO();
            dto.setUrl(media.getUrl());
            dto.setType(media.getType());
            dto.setOrdering(media.getOrdering());
            return dto;
        }).collect(Collectors.toList());
        
        response.setMedia(mediaDTOs);
        
        return response;
    }
    

    @Override
    public NoteDetailResponse updateNote(Long id, NoteRequest request) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new ResourceNotFoundException("笔记不存在");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // 复制基本属性
        BeanUtils.copyProperties(request, note);
        note.setUpdateTime(now);
        note.setStatus(0);  // 重置为待审核状态
        
        // 更新笔记基本信息
        noteMapper.updateById(note);
        
        // 更新媒体文件：先删除原有的媒体文件，再添加新的媒体文件
        if (request.getMedia() != null) {
            // 删除原有媒体文件
            noteMediaMapper.delete(new QueryWrapper<NoteMedia>().eq("note_id", id));
            
            // 插入新的媒体文件
            for (NoteMediaDTO mediaDto : request.getMedia()) {
                NoteMedia media = new NoteMedia();
                media.setNoteId(note.getId());
                media.setUrl(mediaDto.getUrl());
                media.setType(mediaDto.getType());
                media.setOrdering(mediaDto.getOrdering());
                media.setCreateTime(now);
                noteMediaMapper.insert(media);
            }
        }

        // 构建返回的详细响应
        NoteDetailResponse response = new NoteDetailResponse();
        BeanUtils.copyProperties(note, response);
        
        // 查询作者信息
        User user = userMapper.selectById(note.getUserId());
        if (user != null) {
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setUserAvatar(user.getAvatar());
        }
        
        // 添加更新后的媒体文件到响应
        if (request.getMedia() != null) {
            response.setMedia(request.getMedia());
        }
        
        return response;
    }

    @Override
    public void deleteNote(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new ResourceNotFoundException("笔记不存在");
        }
        
        noteMapper.deleteById(id);
    }

    @Override
    public List<NoteResponse> getAllNotes() {
        List<Note> notes = noteMapper.selectList(null);
        
        return notes.stream().map(note -> {
            NoteResponse response = new NoteResponse();
            BeanUtils.copyProperties(note, response);
            return response;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getNotes(int page, int size) {
        Page<Note> pageInfo = new Page<>(page, size);
        IPage<Note> pagedNotes = noteMapper.selectPage(pageInfo, null);

        List<NoteResponse> noteResponses = pagedNotes.getRecords().stream().map(note -> {
            NoteResponse response = new NoteResponse();
            BeanUtils.copyProperties(note, response);
            fillAuthorInfo(note, response);
            return response;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("content", noteResponses);
        result.put("totalElements", pagedNotes.getTotal());
        result.put("page", pagedNotes.getCurrent());
        result.put("size", pagedNotes.getSize());

        return result;
    }

    @Override
    public Map<String, Object> getNotesByUserId(Long userId, int page, int size) {
        Page<Note> pageInfo = new Page<>(page, size);
        QueryWrapper<Note> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("deleted", 0).orderByDesc("create_time");
        IPage<Note> pagedNotes = noteMapper.selectPage(pageInfo, wrapper);

        List<NoteResponse> noteResponses = pagedNotes.getRecords().stream().map(note -> {
            NoteResponse response = new NoteResponse();
            BeanUtils.copyProperties(note, response);
            fillAuthorInfo(note, response);
            return response;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("content", noteResponses);
        result.put("totalElements", pagedNotes.getTotal());
        result.put("page", pagedNotes.getCurrent());
        result.put("size", pagedNotes.getSize());
        return result;
    }

    @Override
    public Map<String, Object> getNotes(int page, int size, String search) {
        // 创建分页对象
        Page<Note> pageObj = new Page<>(page, size);
        
        // 执行带条件的分页查询
        IPage<Note> notePage = noteMapper.findNotesWithSearch(pageObj, search);
        
        // 转换查询结果
        List<NoteResponse> noteResponses = new ArrayList<>();
        Long currentUserId = SecurityUtils.getCurrentUserId();
        
        for (Note note : notePage.getRecords()) {
            User user = userMapper.selectById(note.getUserId());
            NoteResponse response = convertToNoteResponse(note, user);
            
            // 如果用户已登录，添加是否点赞、收藏的信息
            if (currentUserId != null) {
                response.setIsLiked(likeService.isLiked(currentUserId, note.getId()));
                response.setIsFavorited(favoriteService.isFavorited(currentUserId, note.getId()));
            }
            
            noteResponses.add(response);
        }
        
        // 组装返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("content", noteResponses);
        result.put("totalElements", notePage.getTotal());
        result.put("totalPages", notePage.getPages());
        result.put("size", notePage.getSize());
        result.put("number", notePage.getCurrent());
        
        return result;
    }

    // 将 Note 实体转换为 NoteResponse DTO
    private NoteResponse convertToNoteResponse(Note note, User user) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setTitle(note.getTitle());
        response.setContent(note.getContent());
        response.setCoverUrl(note.getCoverUrl());
        response.setLocation(note.getLocation());
        response.setUserId(note.getUserId());
        response.setUsername(user != null ? user.getUsername() : "未知用户");
        response.setUserAvatar(user != null ? user.getAvatar() : null);
        response.setCreateTime(note.getCreateTime());
        response.setViewCount(note.getViewCount());
        response.setLikeCount(note.getLikeCount());
        response.setFavoriteCount(note.getFavoriteCount());
        response.setCommentCount(note.getCommentCount());
        return response;
    }

    private void fillAuthorInfo(Note note, NoteResponse response) {
        User user = userMapper.selectById(note.getUserId());
        if (user != null) {
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setUserAvatar(user.getAvatar());
        }
    }
}
