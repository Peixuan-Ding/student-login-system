# 📚 项目文档

## 文档列表

- [快速安装指南](./INSTALL_GUIDE.md) - 快速开始使用
- [设计问题分析](./DESIGN_ISSUES.md) - 项目问题诊断
- [修复说明](./FIXES_APPLIED.md) - 已实施的修复
- [修复总结](./修复完成总结.md) - 修复完成情况

## 项目结构

```
demo1027/
├── server.js           # 主服务器入口
├── package.json        # 项目依赖
├── config.json         # API 配置
├── .env.example        # 环境变量模板
├── .gitignore          # Git 忽略文件
│
├── routes/             # API 路由模块
│   ├── auth.js         # 认证路由
│   ├── users.js        # 用户管理路由
│   ├── content.js      # 内容管理路由
│   └── ai.js           # AI 服务路由
│
├── middleware/         # 中间件
│   ├── auth.js         # JWT 认证
│   └── errorHandler.js # 错误处理
│
├── utils/              # 工具函数
│   ├── database.js     # 数据库操作
│   ├── config.js       # 配置管理
│   └── aiService.js    # AI 服务
│
├── public/             # 前端静态文件
│   ├── index.html      # 登录页
│   ├── script.js       # 登录逻辑
│   ├── learning-platform.html  # 学习平台
│   ├── learning-platform.js    # 平台逻辑
│   └── *.css           # 样式文件
│
├── database/           # JSON 数据库
│   ├── users.json      # 用户数据
│   ├── courses.json    # 课程数据
│   └── ...
│
└── docs/               # 项目文档
    ├── README.md       # 本文档
    ├── INSTALL_GUIDE.md # 安装指南
    └── ...
```

## 技术栈

- **后端**: Node.js + Express
- **安全**: JWT + bcrypt
- **验证**: express-validator
- **AI**: DeepSeek / Kimi / ChatGPT / 豆包
- **存储**: JSON 文件

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动服务器
npm start

# 3. 访问 http://localhost:3000
```

## API 端点

### 认证
- `POST /api/auth/login` - 用户登录

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 添加用户
- `PUT /api/users/:studentId` - 更新用户

### 内容管理
- `GET /api/courses` - 获取课程
- `GET /api/materials` - 获取材料
- `GET /api/lesson-plans` - 获取教案
- `GET /api/resources` - 获取资源

### AI 服务
- `POST /api/chat` - 通用 AI 调用
- `POST /api/deepseek/chat` - DeepSeek
- `POST /api/kimi/chat` - Kimi
- `POST /api/chatgpt/chat` - ChatGPT
- `POST /api/doubao/chat` - 豆包

## 环境变量

创建 `.env` 文件：

```env
JWT_SECRET=your-secret-key-change-in-production
DEEPSEEK_API_KEY=sk-xxxxx
KIMI_API_KEY=your-key
OPENAI_API_KEY=sk-xxxxx
DOUBAO_API_KEY=your-key
PORT=3000
```

## 安全特性

✅ 密码 bcrypt 加密  
✅ JWT token 会话管理  
✅ 环境变量存储敏感信息  
✅ 输入验证防止注入  
✅ 统一错误处理  
✅ 内部函数调用避免 HTTP 自调用

## 测试账户

- **学号**: 12345678
- **密码**: abcdef

## 许可证

本项目用于学习和研究目的。
