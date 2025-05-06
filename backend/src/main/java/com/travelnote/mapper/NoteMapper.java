package com.travelnote.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travelnote.entity.Note;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * Note Mapper
 */
@Mapper
public interface NoteMapper extends BaseMapper<Note> {

    /**
     * Find notes by status
     *
     * @param status status
     * @return Note list
     */
    @Select("SELECT * FROM note WHERE status = #{status} AND deleted = 0 ORDER BY create_time DESC")
    List<Note> findByStatus(@Param("status") Integer status);

    /**
     * Find notes by user ID
     *
     * @param userId user ID
     * @return Note list
     */
    @Select("SELECT * FROM note WHERE user_id = #{userId} AND deleted = 0 ORDER BY create_time DESC")
    List<Note> findByUserId(@Param("userId") Long userId);

    /**
     * Find approved notes with pagination
     *
     * @param page page object
     * @return IPage<Note>
     */
    @Select("SELECT * FROM note WHERE status = 1 AND deleted = 0 ORDER BY create_time DESC")
    IPage<Note> findApprovedNotes(Page<Note> page);

    /**
     * Find notes by status with pagination
     *
     * @param page page object
     * @param status status
     * @return IPage<Note>
     */
    @Select("SELECT * FROM note WHERE status = #{status} AND deleted = 0 ORDER BY create_time DESC")
    IPage<Note> findNotesByStatus(Page<Note> page, @Param("status") Integer status);

    /**
     * 根据搜索条件查询笔记
     * 搜索标题、内容、位置信息或查询指定用户的笔记
     *
     * @param page 分页对象
     * @param search 搜索关键词
     * @return IPage<Note>
     */
    @Select("<script>" +
            "SELECT n.* FROM note n " +
            "LEFT JOIN user u ON n.user_id = u.id " +
            "WHERE n.status = 1 AND n.deleted = 0 " +
            "<if test='search != null and search != \"\"'>" +
            "AND (n.title LIKE CONCAT('%',#{search},'%') " +
            "OR n.content LIKE CONCAT('%',#{search},'%') " +
            "OR n.location LIKE CONCAT('%',#{search},'%') " +
            "OR u.username LIKE CONCAT('%',#{search},'%'))" +
            "</if> " +
            "ORDER BY n.create_time DESC" +
            "</script>")
    IPage<Note> findNotesWithSearch(Page<Note> page, @Param("search") String search);
}