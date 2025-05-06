package com.travelnote.task;

import com.travelnote.entity.StatsTask;
import com.travelnote.entity.StatsTask.TaskType;
import com.travelnote.entity.StatsTask.TaskStatus;
import com.travelnote.mapper.StatsTaskMapper;
import com.travelnote.service.StatsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class StatsSyncTask {

    @Autowired
    private StatsService statsService;
    
    @Autowired
    private StatsTaskMapper statsTaskMapper;
    
    /**
     * 每分钟执行一次实时数据同步
     */
    @Scheduled(cron = "0 * * * * ?")
    public void realtimeSync() {
        String taskType = TaskType.REALTIME.getValue();
        StatsTask task = createTask(taskType);
        
        try {
            log.info("开始执行实时统计数据同步任务");
            statsService.syncAllStatsToDB();
            
            // 更新任务状态为完成
            completeTask(task);
            log.info("实时统计数据同步任务执行完成");
        } catch (Exception e) {
            // 更新任务状态为失败
            failTask(task, e.getMessage());
            log.error("实时统计数据同步任务执行失败", e);
        }
    }
    
    /**
     * 每天凌晨2点执行一次每日数据同步
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void dailySync() {
        String taskType = TaskType.DAILY.getValue();
        StatsTask task = createTask(taskType);
        
        try {
            log.info("开始执行每日统计数据同步任务");
            statsService.syncAllStatsToDB();
            
            // 更新任务状态为完成
            completeTask(task);
            log.info("每日统计数据同步任务执行完成");
        } catch (Exception e) {
            // 更新任务状态为失败
            failTask(task, e.getMessage());
            log.error("每日统计数据同步任务执行失败", e);
        }
    }
    
    /**
     * 每周一凌晨3点执行一次每周数据同步
     */
    @Scheduled(cron = "0 0 3 ? * MON")
    public void weeklySync() {
        String taskType = TaskType.WEEKLY.getValue();
        StatsTask task = createTask(taskType);
        
        try {
            log.info("开始执行每周统计数据同步任务");
            statsService.syncAllStatsToDB();
            
            // 更新任务状态为完成
            completeTask(task);
            log.info("每周统计数据同步任务执行完成");
        } catch (Exception e) {
            // 更新任务状态为失败
            failTask(task, e.getMessage());
            log.error("每周统计数据同步任务执行失败", e);
        }
    }
    
    /**
     * 创建统计任务记录
     */
    private StatsTask createTask(String taskType) {
        LocalDateTime now = LocalDateTime.now();
        StatsTask task = StatsTask.builder()
                .taskType(taskType)
                .status(TaskStatus.RUNNING.getValue())
                .startTime(now)
                .createTime(now)
                .updateTime(now)
                .build();
        
        statsTaskMapper.insert(task);
        return task;
    }
    
    /**
     * 更新任务状态为完成
     */
    private void completeTask(StatsTask task) {
        LocalDateTime now = LocalDateTime.now();
        task.setStatus(TaskStatus.COMPLETED.getValue());
        task.setEndTime(now);
        task.setUpdateTime(now);
        
        statsTaskMapper.updateById(task);
    }
    
    /**
     * 更新任务状态为失败
     */
    private void failTask(StatsTask task, String errorMessage) {
        LocalDateTime now = LocalDateTime.now();
        task.setStatus(TaskStatus.FAILED.getValue());
        task.setEndTime(now);
        task.setUpdateTime(now);
        task.setErrorMessage(errorMessage);
        
        statsTaskMapper.updateById(task);
    }
}