package com.travelnote.controller;

import com.travelnote.dto.ResponseResult;
import com.travelnote.service.impl.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    private final MinioService minioService;

    /**
     * 上传媒体文件（图片或视频）
     * 前端使用 FormData 上传：file + type
     */
    @PostMapping("/media")
    public ResponseResult<?> uploadMedia(@RequestPart("file") MultipartFile file,
                                         @RequestParam("type") String type) {
        if (file == null || file.isEmpty()) {
            return ResponseResult.error("文件不能为空");
        }
        if (type == null || type.isBlank()) {
            return ResponseResult.error("type 参数不能为空");
        }

        try {
            String relativePath = minioService.uploadFile(file, type);
            // 符合前端：response.data.data.url
            return ResponseResult.success(new MediaUploadResponse(relativePath));
        } catch (Exception e) {
            return ResponseResult.error("上传失败：" + e.getMessage());
        }
    }
    
    @PostMapping("/avatar")
    public ResponseResult<?> uploadAvatar(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseResult.error("文件不能为空");
        }

        try {
            String relativePath = minioService.uploadFile(file, "image");
            // 符合前端：response.data.data.url
            return ResponseResult.success(new MediaUploadResponse(relativePath));
        } catch (Exception e) {
            return ResponseResult.error("上传失败：" + e.getMessage());
        }
    }

    /**
     * 获取单个文件的预签名URL
     */
    @GetMapping("/presigned-url")
    public ResponseResult<?> getPresignedUrl(@RequestParam("path") String path) {
        try {
            String presignedUrl = minioService.getPresignedUrl(path);
            return ResponseResult.success(Map.of("url", presignedUrl));
        } catch (Exception e) {
            return ResponseResult.error("获取URL失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量获取预签名URL
     */
    @PostMapping("/batch-presigned-urls")
    public ResponseResult<?> batchGetPresignedUrls(@RequestBody List<String> paths) {
        try {
            Map<String, String> urlMap = paths.stream()
                .collect(Collectors.toMap(
                    path -> path,
                    path -> minioService.getPresignedUrl(path)
                ));
            return ResponseResult.success(urlMap);
        } catch (Exception e) {
            return ResponseResult.error("获取URL失败：" + e.getMessage());
        }
    }

    /**
     * 媒体上传响应格式
     */
    private record MediaUploadResponse(String url) {}
}