package com.travelnote.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travelnote.entity.StatsTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface StatsTaskMapper extends BaseMapper<StatsTask> {
    
    /**
     * 根据任务类型和状态查找任务
     */
    @Select("SELECT * FROM stats_task WHERE task_type = #{taskType} AND status = #{status}")
    List<StatsTask> findByTaskTypeAndStatus(@Param("taskType") String taskType, @Param("status") Integer status);
    
    /**
     * 查找指定类型的最后一个完成的任务
     */
    @Select("SELECT * FROM stats_task WHERE task_type = #{taskType} AND status = #{status} ORDER BY end_time DESC LIMIT 1")
    StatsTask findLastCompletedTask(@Param("taskType") String taskType, @Param("status") Integer status);
    
    /**
     * 查找指定时间段内创建的任务
     */
    @Select("SELECT * FROM stats_task WHERE create_time BETWEEN #{startTime} AND #{endTime}")
    List<StatsTask> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}