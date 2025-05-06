package com.travelnote.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travelnote.entity.NoteView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface NoteViewMapper extends BaseMapper<NoteView> {
    
    /**
     * 根据笔记ID统计浏览数
     */
    @Select("SELECT COUNT(1) FROM note_view WHERE note_id = #{noteId}")
    long countByNoteId(@Param("noteId") Long noteId);
    
    /**
     * 根据笔记ID和时间范围统计浏览数
     */
    @Select("SELECT COUNT(1) FROM note_view WHERE note_id = #{noteId} AND view_time BETWEEN #{startTime} AND #{endTime}")
    long countByNoteIdAndViewTimeBetween(@Param("noteId") Long noteId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 根据笔记ID统计独立访客数（根据用户ID和IP去重）
     */
    @Select("SELECT COUNT(DISTINCT COALESCE(user_id, ip)) FROM note_view WHERE note_id = #{noteId}")
    long countUniqueViewsByNoteId(@Param("noteId") Long noteId);
    
    /**
     * 根据笔记ID和时间范围统计独立访客数
     */
    @Select("SELECT COUNT(DISTINCT COALESCE(user_id, ip)) FROM note_view WHERE note_id = #{noteId} AND view_time BETWEEN #{startTime} AND #{endTime}")
    long countUniqueViewsByNoteIdAndTimeBetween(@Param("noteId") Long noteId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 获取特定时间段内有浏览记录的笔记ID列表
     */
    @Select("SELECT DISTINCT note_id FROM note_view WHERE view_time BETWEEN #{startTime} AND #{endTime}")
    List<Long> findDistinctNoteIdsByViewTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}