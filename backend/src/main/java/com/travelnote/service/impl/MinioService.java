package com.travelnote.service.impl;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinIO Service for file operations
 */
@Slf4j
@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    /**
     * Initialize bucket when service starts
     */
    public void init() {
        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Created MinIO bucket: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Error initializing MinIO bucket: {}", e.getMessage(), e);
        }
    }

    /**
     * Upload file and return relative path
     *
     * @param file     file to upload
     * @param fileType file type (e.g., "image", "video")
     * @return relative file path
     */
    public String uploadFile(MultipartFile file, String fileType) throws IOException {
        try {
            // Generate unique file name to avoid conflicts
            String fileName = generateFileName(file.getOriginalFilename());
            String objectName = String.format("%s/%s", fileType, fileName);

            // Upload file
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .contentType(file.getContentType())
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .build()
            );

            log.info("File uploaded successfully: {}", objectName);
            // 返回相对路径而不是完整URL
            return "/" + bucketName + "/" + objectName;
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            throw new IOException("Could not upload file", e);
        }
    }

    /**
     * Delete file
     *
     * @param objectName object name to delete
     */
    public void deleteFile(String objectName) {
        try {
            // 如果是相对路径，提取对象名称
            if (objectName.startsWith("/" + bucketName + "/")) {
                objectName = objectName.substring(("/" + bucketName + "/").length());
            }
            
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("File deleted successfully: {}", objectName);
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage(), e);
        }
    }

    /**
     * 根据相对路径生成临时访问URL
     *
     * @param relativePath 相对路径，格式如: /bucket-name/object-name
     * @return 带有访问令牌的完整URL
     */
    public String getPresignedUrl(String relativePath) {
        try {
            // 从路径中提取实际的对象名称
            String objectName = relativePath;
            if (relativePath.startsWith("/" + bucketName + "/")) {
                objectName = relativePath.substring(("/" + bucketName + "/").length());
            }
            
            // 生成预签名URL, 7天有效期
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(7, TimeUnit.DAYS)
                    .build());
        } catch (Exception e) {
            log.error("生成预签名URL失败: {}", e.getMessage(), e);
            throw new RuntimeException("无法生成访问链接", e);
        }
    }

    /**
     * 检查路径是否是相对路径
     * 
     * @param path 待检查的路径
     * @return 是否是相对路径
     */
    public boolean isRelativePath(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }
        return path.startsWith("/") && !path.startsWith("//") && !path.contains("://");
    }

    /**
     * Generate unique file name
     *
     * @param originalFilename original file name
     * @return unique file name
     */
    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}