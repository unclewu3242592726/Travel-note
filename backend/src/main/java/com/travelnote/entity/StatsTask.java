package com.travelnote.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("stats_task")
public class StatsTask {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("task_type")
    private String taskType;
    
    private Integer status;
    
    @TableField("start_time")
    private LocalDateTime startTime;
    
    @TableField("end_time")
    private LocalDateTime endTime;
    
    @TableField("create_time")
    private LocalDateTime createTime;
    
    @TableField("update_time")
    private LocalDateTime updateTime;
    
    @TableField("error_message") 
    private String errorMessage;
    
    public enum TaskType {
        DAILY("DAILY"),
        WEEKLY("WEEKLY"),
        REALTIME("REALTIME");
        
        private final String value;
        
        TaskType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    public enum TaskStatus {
        PENDING(0),
        RUNNING(1),
        COMPLETED(2),
        FAILED(3);
        
        private final int value;
        
        TaskStatus(int value) {
            this.value = value;
        }
        
        public int getValue() {
            return value;
        }
    }
}