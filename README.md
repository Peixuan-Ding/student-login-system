# 学科教学智能平台

一个现代化的 AI 辅助学习平台，整合了多种 AI 模型，为教学和学习提供智能化支持。

## ✨ 主要特性

- 🤖 **多 AI 模型支持**: DeepSeek、Kimi、ChatGPT、豆包
- 🔐 **安全认证**: JWT token + bcrypt 密码加密
- 📚 **教学管理**: 课程、教案、材料、资源一体化管理
- 💡 **智能交互**: AI 对话助手，个性化学习推荐
- 🎨 **现代 UI**: 响应式设计，优雅的用户体验

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 密钥

复制配置文件模板：

```bash
# Windows
Copy-Item config.example.json config.json

# Linux/Mac
cp config.example.json config.json
```

编辑 `config.json` 文件，添加你的 API 密钥：

```json
{
  "deepseek": {
    "apiKey": "your-deepseek-api-key"
  },
  "kimi": {
    "apiKey": "your-kimi-api-key"
  },
  "chatgpt": {
    "apiKey": "your-chatgpt-api-key"
  },
  "doubao": {
    "apiKey": "your-doubao-api-key"
  }
}
```

> ⚠️ **安全提醒**: `config.json` 包含敏感信息，已自动被 `.gitignore` 忽略，不会被上传到 GitHub。

### 3. 启动服务器

```bash
npm start
```

### 4. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 📤 部署到 GitHub

**当前状态**:
- ✅ `config.json` 已被 `.gitignore` 忽略，**不会**上传敏感密钥
- ✅ API 密钥安全，不会泄露
- ✅ 项目可以安全推送到 GitHub

**其他用户克隆项目后**:
1. 复制 `config.example.json` 为 `config.json`
2. 填写自己的 API 密钥
3. 运行项目

## 📖 测试账户

- **学号**: `12345678`
- **密码**: `abcdef`

## 📁 项目结构

```
demo1027/
├── server.js           # 主服务器入口
├── package.json        # 项目依赖
├── config.json         # API 配置
│
├── routes/             # API 路由
│   ├── auth.js         # 认证
│   ├── users.js        # 用户管理
│   ├── content.js      # 内容管理
│   └── ai.js           # AI 服务
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
├── public/             # 前端文件
│   ├── index.html      # 登录页
│   ├── learning-platform.html  # 学习平台
│   └── *.css, *.js    # 样式和脚本
│
├── database/           # JSON 数据库
└── docs/               # 文档
```

## 🔌 API 端点

### 认证
- `POST /api/auth/login` - 用户登录

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 添加用户
- `PUT /api/users/:studentId` - 更新用户

### AI 服务
- `POST /api/chat` - 通用 AI 调用
- `POST /api/deepseek/chat` - DeepSeek
- `POST /api/kimi/chat` - Kimi
- `POST /api/chatgpt/chat` - ChatGPT
- `POST /api/doubao/chat` - 豆包

## 🔒 安全特性

- ✅ 密码 bcrypt 加密
- ✅ JWT token 会话管理
- ✅ 环境变量存储敏感信息
- ✅ 输入验证（express-validator）
- ✅ 统一错误处理
- ✅ 避免 HTTP 自调用

## 📚 文档

详细文档请查看 [docs 目录](./docs/)：
- [安装指南](./docs/INSTALL_GUIDE.md)
- [API 文档](./docs/README.md)
- [问题分析](./docs/DESIGN_ISSUES.md)
- [修复说明](./docs/FIXES_APPLIED.md)

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **安全**: JWT + bcrypt
- **验证**: express-validator
- **AI**: DeepSeek / Kimi / ChatGPT / 豆包
- **前端**: 原生 HTML/CSS/JavaScript
- **存储**: JSON 文件

## 📝 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目用于学习和研究目的。

