# 旅游笔记平台

一个完全不整的旅游笔记平台，包含移动端用户应用和后台管理系统。

参加携程前端训练营没参加上，第一次用react，不懂。面向GPT的copy开发。
主要做了mobile端，PC端全部AI生成。
<img src="./public/pc.png" alt="Edge"  />
<img src="./public/mobile1.pic.jpg" width="160px"  />
<img src="./public/mobile2.jpg" width="160px"  />
<img src="./public/mobile3.pic.jpg"  width="160px" />


## 项目架构

项目由三个主要部分组成：

1. **移动端用户应用（mobile-web）**：使用 React + TypeScript 开发的移动优先 Web 应用
2. **后台管理系统（admin-dashboard）**：使用 React + Ant Design 开发的管理界面
3. **后端服务（backend）**：使用 Java + Spring Boot 开发的后端 API

## 技术栈

### 前端

- React 
- TypeScript
- React Router
- Ant Design
- Axios
- ECharts (管理后台数据可视化)

### 后端

- Java
- Spring Boot
- Spring Security + JWT
- MyBatis-Plus
- Redis
- MinIO
- RabbitMQ
- MySQL

## 功能特性

### 移动端用户应用

- 用户注册、登录（支持用户名/手机号/邮箱登录）
- 发布旅游笔记（文字、图片、视频）
- 浏览、评论、点赞、收藏笔记
- 个人中心，管理自己的笔记和收藏

### 后台管理系统

- 管理员登录
- 数据面板，显示用户数、笔记数、PV/UV 等统计信息
- 笔记管理（审核、查看）
- 用户管理（查看、封禁）
- 举报管理

## 如何运行

### 数据库初始化

1. 确保MySQL服务已启动
2. 数据库将在应用首次启动时自动创建（travel_notes）
3. 表结构和初始管理员账号也会自动创建
   - 初始管理员账号: admin
   - 初始密码: admin123

### 后端服务

1. 配置 MySQL、Redis、MinIO、RabbitMQ
2. 修改 `backend/src/main/resources/application.yml` 中的连接配置
3. 执行以下命令运行后端服务：

```bash
cd backend
./mvnw spring-boot:run
```

### 移动端用户应用

```bash
cd mobile-web
npm install
npm start
```

应用将在 http://localhost:3000 运行

### andriod打包
```bash
npm run build && npx cap sync android
```
导入idea运行
### 后台管理系统

```bash
cd admin-dashboard
npm install
npm start
```

应用将在 http://localhost:3001 运行（需要修改 package.json 中的启动端口）

## 项目结构

```
project-root/
├── backend/                     # Spring Boot 服务
│   ├── src/main/java/com/travelnote/
│   │   ├── controller/          # API 控制器
│   │   ├── service/             # 业务逻辑层
│   │   ├── mapper/              # 数据访问层
│   │   ├── entity/              # 实体类
│   │   ├── config/              # 配置类
│   │   ├── security/            # 安全相关
│   │   └── util/                # 工具类
│   └── resources/               # 配置文件
│       └── sql/                 # SQL脚本
├── mobile-web/                  # React 用户端
│   ├── public/
│   ├── src/
│   │   ├── components/          # 组件
│   │   ├── contexts/            # 上下文
│   │   ├── layouts/             # 布局
│   │   ├── pages/               # 页面
│   │   └── styles/              # CSS 样式
└── admin-dashboard/             # React 管理后台
    ├── public/
    └── src/
        ├── components/          # 组件
        ├── contexts/            # 上下文
        ├── layouts/             # 布局
        ├── pages/               # 页面
        └── styles/              # CSS 样式
```

## 许可证

MIT 