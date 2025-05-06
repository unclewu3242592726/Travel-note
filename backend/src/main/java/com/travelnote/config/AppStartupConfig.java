package com.travelnote.config;

import com.travelnote.util.DatabaseMigration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * 应用启动配置
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AppStartupConfig {

    private final Environment environment;
    private final DatabaseMigration databaseMigration;

    /**
     * 应用启动后执行
     */
    @Bean
    public ApplicationRunner applicationRunner() {
        return args -> {
            log.info("旅行笔记应用启动完成");
            
            // 检查是否启用了迁移自动执行
            boolean isDev = Arrays.asList(environment.getActiveProfiles()).contains("dev");
            boolean migrationEnabled = Boolean.parseBoolean(environment.getProperty("app.minio-migration.enabled", "false"));
            boolean autoRun = Boolean.parseBoolean(environment.getProperty("app.minio-migration.auto-run", "false"));
            
            if ((isDev || migrationEnabled) && autoRun) {
                log.info("开始执行MinIO URL迁移...");
                try {
                    databaseMigration.migrateMinioUrls();
                    log.info("MinIO URL迁移已完成");
                } catch (Exception e) {
                    log.error("MinIO URL迁移失败", e);
                }
            }
        };
    }
}