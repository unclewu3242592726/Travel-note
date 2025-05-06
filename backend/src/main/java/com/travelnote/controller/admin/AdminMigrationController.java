package com.travelnote.controller.admin;

import com.travelnote.dto.ResponseResult;
import com.travelnote.util.DatabaseMigration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员迁移控制器
 * 用于提供数据迁移相关的API
 */
@RestController
@RequestMapping("/admin/migrate")
@RequiredArgsConstructor
@Slf4j
public class AdminMigrationController {

    private final DatabaseMigration databaseMigration;
    
    /**
     * 执行MinIO URL迁移
     * 将完整的MinIO URL转换为相对路径
     * 需要管理员权限
     */
    @PostMapping("/minio-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseResult<?> migrateMinioUrls() {
        log.info("管理员触发MinIO URL迁移");
        try {
            databaseMigration.migrateMinioUrls();
            log.info("MinIO URL迁移完成");
            return ResponseResult.success("迁移成功完成");
        } catch (Exception e) {
            log.error("MinIO URL迁移失败", e);
            return ResponseResult.error("迁移失败: " + e.getMessage());
        }
    }
}