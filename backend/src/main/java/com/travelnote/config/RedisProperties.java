package com.travelnote.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Getter
@Component
@ConfigurationProperties("spring.data.redis")
public class RedisProperties {
    // Getters and setters
    private String host;
    private int port;
    private String password;
    private int database;
    private int timeout;

}