package com.travelnote.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 数据库迁移工具
 * 用于将数据库中存储的完整MinIO URL转换为相对路径
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigration {

    private final JdbcTemplate jdbcTemplate;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    @Value("${minio.bucketName}")
    private String bucketName;

    /**
     * 将数据库中的完整MinIO URL转换为相对路径
     */
    @Transactional
    public void migrateMinioUrls() {
        log.info("开始迁移MinIO URL为相对路径...");
        
        // MinIO URL的正则表达式模式
        String minioUrlPattern = minioEndpoint + "/" + bucketName + "/(.*?)(?:\\?.*)?$";
        Pattern pattern = Pattern.compile(minioUrlPattern);

        // 更新用户表中的头像
        migrateTable("user", "avatar", pattern);
        
        // 更新笔记表中的封面图片
        migrateTable("note", "cover_url", pattern);
        
        // 更新笔记媒体表中的URL
        migrateTable("note_media", "url", pattern);
        
        log.info("MinIO URL迁移完成");
    }

    private void migrateTable(String tableName, String columnName, Pattern pattern) {
        // 查询所有包含MinIO URL的记录
        String selectSql = "SELECT id, " + columnName + " FROM " + tableName + 
                " WHERE " + columnName + " LIKE ?";
        List<Map<String, Object>> records = jdbcTemplate.queryForList(
                selectSql, minioEndpoint + "/%");
        
        int updatedCount = 0;
        for (Map<String, Object> record : records) {
            Long id = (Long) record.get("id");
            String url = (String) record.get(columnName);
            
            if (url == null) continue;
            
            // 转换为相对路径
            Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                String objectPath = matcher.group(1);
                String relativePath = "/" + bucketName + "/" + objectPath;
                
                // 更新数据库
                String updateSql = "UPDATE " + tableName + " SET " + columnName + " = ? WHERE id = ?";
                jdbcTemplate.update(updateSql, relativePath, id);
                updatedCount++;
                log.debug("已更新{}表ID={}的{}列: {} -> {}", tableName, id, columnName, url, relativePath);
            }
        }
        
        log.info("表 {} 的 {} 字段共更新了 {} 条记录", tableName, columnName, updatedCount);
    }
}