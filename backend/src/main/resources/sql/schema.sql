-- 创建数据库
CREATE DATABASE IF NOT EXISTS travel_notes DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE travel_notes;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(128) NOT NULL COMMENT '密码',
  `email` varchar(50) NOT NULL COMMENT '邮箱',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `introduction` varchar(500) DEFAULT NULL COMMENT '个人介绍',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态：0-正常，1-封禁',
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '类型：0-普通用户，1-管理员',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 旅游笔记表
CREATE TABLE IF NOT EXISTS `note` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '笔记ID',
  `title` varchar(100) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `location` varchar(100) DEFAULT NULL COMMENT '位置信息',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `like_count` int(11) NOT NULL DEFAULT '0' COMMENT '点赞数',
  `favorite_count` int(11) NOT NULL DEFAULT '0' COMMENT '收藏数',
  `view_count` int(11) NOT NULL DEFAULT '0' COMMENT '浏览数',
  `comment_count` int(11) NOT NULL DEFAULT '0' COMMENT '评论数',
  `unique_view_count` int(11) NOT NULL DEFAULT '0' COMMENT '独立访客数',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
  `cover_url` varchar(255) DEFAULT NULL COMMENT '封面图URL',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='旅游笔记表';

-- 笔记媒体表
CREATE TABLE IF NOT EXISTS `note_media` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '媒体ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `url` varchar(255) NOT NULL COMMENT '媒体URL',
  `type` tinyint(4) NOT NULL COMMENT '类型：0-图片，1-视频',
  `ordering` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_note_id` (`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='笔记媒体表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `content` varchar(500) NOT NULL COMMENT '评论内容',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '父评论ID，0表示顶级评论',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_note_id` (`note_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 点赞表
CREATE TABLE IF NOT EXISTS `like` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_note_user` (`note_id`,`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorite` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_note_user` (`note_id`,`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 举报表
CREATE TABLE IF NOT EXISTS `report` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '举报ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `user_id` bigint(20) NOT NULL COMMENT '举报用户ID',
  `reason` varchar(500) NOT NULL COMMENT '举报原因',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态：0-待处理，1-已处理',
  `result` tinyint(4) DEFAULT NULL COMMENT '处理结果：0-忽略，1-删除笔记',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `process_time` datetime DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `idx_note_id` (`note_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报表';

-- 笔记浏览记录表
CREATE TABLE IF NOT EXISTS `note_view` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '浏览记录ID',
  `note_id` bigint(20) NOT NULL COMMENT '笔记ID',
  `user_id` bigint(20) DEFAULT NULL COMMENT '用户ID，匿名用户为NULL',
  `ip` varchar(50) DEFAULT NULL COMMENT '访问IP',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '浏览器UA',
  `view_time` datetime NOT NULL COMMENT '浏览时间',
  PRIMARY KEY (`id`),
  KEY `idx_note_id` (`note_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_view_time` (`view_time`),
  KEY `idx_note_user` (`note_id`, `user_id`, `ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='笔记浏览记录表';

-- 统计任务记录表
CREATE TABLE IF NOT EXISTS `stats_task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_type` varchar(50) NOT NULL COMMENT '任务类型: DAILY,WEEKLY,REALTIME',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态: 0-待执行,1-执行中,2-已完成,3-失败',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `error_message` text COMMENT '错误信息',
  PRIMARY KEY (`id`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统计任务记录表';

-- 初始化管理员账号
INSERT INTO `user` (`username`, `password`, `email`, `mobile`, `status`, `type`, `create_time`, `update_time`, `deleted`)
VALUES ('admin', '$2a$10$vR.hY0lE9DZ/BvH/lgPxduLQPJSyZ9q5wvI6sWuuUjJCEHONgbVTC', 'admin@travelnotes.com', '13800000000', 0, 1, NOW(), NOW(), 0);
-- 密码为 admin123，使用了BCrypt加密