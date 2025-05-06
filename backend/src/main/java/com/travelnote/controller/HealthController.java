package com.travelnote.controller;

import com.travelnote.dto.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.http.HttpStatus;

/**
 * 健康检查控制器，用于网络状态检测和服务健康监控
 */
@RestController
@RequestMapping("/")
@Tag(name = "系统健康检查")
public class HealthController {

    /**
     * Ping端点，用于检测服务是否可用
     * 支持GET和HEAD方法
     * @return 服务健康状态
     */
    @RequestMapping(value = "ping", method = {RequestMethod.GET, RequestMethod.HEAD})
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "网络连接检测")
    public ResponseResult<String> ping() {
        return ResponseResult.success("pong");
    }
}