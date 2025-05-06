package com.travelnote;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@MapperScan("com.travelnote.mapper")
public class TravelNoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelNoteApplication.class, args);
    }
} 