package com.travelnote.service;

import com.travelnote.dto.note.NoteDetailResponse;
import com.travelnote.dto.note.NoteRequest;
import com.travelnote.dto.note.NoteResponse;

import java.util.List;
import java.util.Map;

public interface NoteService {
    
    /**
     * 创建笔记
     */
    NoteResponse createNote(NoteRequest request);
    
    /**
     * 根据ID获取笔记
     */
    NoteResponse getNoteById(Long id);
    
    /**
     * 更新笔记
     */
    NoteDetailResponse updateNote(Long id, NoteRequest request);
    
    /**
     * 删除笔记
     */
    void deleteNote(Long id);
    
    /**
     * 获取所有笔记
     */
    List<NoteResponse> getAllNotes();

    Map<String, Object> getNotes(int page, int size);

    /**
     * 分页获取笔记列表并支持搜索
     * 
     * @param page 页码
     * @param size 每页大小
     * @param search 搜索关键词
     * @return 笔记列表和分页信息
     */
    Map<String, Object> getNotes(int page, int size, String search);

    /**
     * 获取用户的笔记列表
     */
    Map<String, Object> getNotesByUserId(Long userId, int page, int size);

    NoteDetailResponse getNoteDetailById(Long id);
}
