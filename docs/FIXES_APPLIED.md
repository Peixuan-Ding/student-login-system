# 设计问题修复说明

## 📋 已修复的问题

本文档列出了已修复的设计问题和使用说明。

---

## ✅ 已完成的修复

### 1. 密码加密 (bcrypt) ✅
**问题**: 密码明文存储
**修复**: 
- 添加了 bcrypt 密码加密
- 新用户密码自动加密存储
- 旧明文密码首次登录后自动升级为加密密码
- 向后兼容旧密码

**位置**: `server.js` 行 114-131

### 2. JWT 会话管理 ✅
**问题**: 无会话管理，使用不安全的 localStorage
**修复**:
- 添加 JWT token 生成和验证
- 登录成功后返回 token
- token 有效期 7 天
- 前端自动在 API 请求中添加 Authorization header

**位置**: 
- `server.js` 行 19-35, 137-142
- `script.js` 行 114
- `learning-platform.js` 行 1346-1354

### 3. API 自调用问题修复 ✅
**问题**: 服务器通过 HTTP 调用自己，浪费资源
**修复**:
- 创建内部 `callAIAPI()` 函数
- 直接调用内部函数，避免 HTTP 请求
- 移除了 localhost 硬编码

**位置**: `server.js` 行 499-574

### 4. 输入验证 ✅
**问题**: 没有输入验证
**修复**:
- 使用 express-validator
- 登录和注册接口添加了验证
- 防止空值、SQL 注入等

**位置**: `server.js` 行 90-93, 178-183

### 5. 错误处理改进 ✅
**问题**: 错误处理不完善
**修复**:
- 添加统一的错误处理中间件
- 隐藏生产环境内部错误
- 改善错误日志

**位置**: `server.js` 行 37-44, 593

### 6. 环境变量支持 ✅
**问题**: API 密钥硬编码在 config.json
**修复**:
- 添加 .env 支持
- 支持环境变量配置 API 密钥
- 创建 .env.example 模板

**位置**: 
- `.env.example` (新建)
- `server.js` 行 1
- `server.js` 行 284, 321, 358, 395

---

## 📦 安装新依赖

修复添加了以下新的依赖包：

```json
{
  "bcrypt": "^5.1.1",           // 密码加密
  "jsonwebtoken": "^9.0.2",     // JWT token
  "express-validator": "^7.0.1", // 输入验证
  "dotenv": "^16.3.1"            // 环境变量
}
```

### 安装步骤

```bash
npm install
```

如果 npm 不可用，请确保安装了 Node.js 并在项目目录下运行上述命令。

---

## 🔧 配置说明

### 1. 创建 .env 文件

复制 `.env.example` 并创建 `.env` 文件：

```bash
cp .env.example .env
```

### 2. 配置 JWT 密钥

在 `.env` 文件中设置一个强随机的 JWT_SECRET：

```env
JWT_SECRET=your-very-random-and-secure-secret-key-at-least-32-characters
```

### 3. 配置 API 密钥

可以选择使用环境变量或 config.json：

**方式 1: 环境变量（推荐）**
```env
DEEPSEEK_API_KEY=sk-xxxxx
KIMI_API_KEY=your-kimi-key
OPENAI_API_KEY=your-openai-key
DOUBAO_API_KEY=your-doubao-key
```

**方式 2: config.json（不推荐生产环境）**
```json
{
  "deepseek": {
    "apiKey": "sk-xxxxx"
  }
}
```

---

## 🚀 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

---

## 📝 主要改动总结

### server.js
1. ✅ 添加 bcrypt、jwt、express-validator、dotenv 依赖
2. ✅ 添加 JWT 认证中间件
3. ✅ 添加错误处理中间件
4. ✅ 登录接口添加密码加密和 JWT token
5. ✅ 添加用户接口添加密码加密和输入验证
6. ✅ 修复 API 自调用问题
7. ✅ 支持环境变量配置

### script.js
1. ✅ 登录成功保存 JWT token
2. ✅ 改善错误提示

### learning-platform.js
1. ✅ API 调用添加 Authorization header
2. ✅ 自动使用存储的 JWT token

### package.json
1. ✅ 添加新依赖包

### 新建文件
1. ✅ `.env.example` - 环境变量模板
2. ✅ `.gitignore` - 忽略敏感文件

---

## 🔒 安全性改进

### 修复前 vs 修复后

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| 密码存储 | 明文存储 ❌ | bcrypt 加密 ✅ |
| 会话管理 | localStorage 不安全 | JWT token ✅ |
| API 密钥 | 硬编码 ❌ | 环境变量 ✅ |
| 输入验证 | 无验证 | express-validator ✅ |
| 错误处理 | 暴露内部错误 | 统一处理 ✅ |
| API 路由 | HTTP 自调用 | 内部调用 ✅ |

---

## ⚠️ 注意事项

### 1. 密码迁移
- 旧用户的明文密码在首次登录时会自动升级为加密密码
- 无需手动操作

### 2. Token 过期
- JWT token 有效期 7 天
- 过期后需要重新登录
- 前端自动处理 token 过期情况

### 3. 生产环境
建议在生产环境中：
1. ✅ 使用 HTTPS（非 HTTP）
2. ✅ 设置强随机的 JWT_SECRET
3. ✅ 使用环境变量存储 API 密钥
4. ✅ 添加限流和速率限制
5. ✅ 启用日志记录
6. ✅ 定期备份数据库

---

## 🧪 测试

### 测试登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"12345678","password":"abcdef"}'
```

预期响应：
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### 测试带 token 的 API
```bash
curl -X POST http://localhost:3000/api/deepseek/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ ... }'
```

---

## 📚 后续建议

虽然已经修复了主要安全问题，但仍有一些建议：

### 高优先级
- [ ] 迁移到 PostgreSQL 或 MongoDB（当前使用 JSON 文件）
- [ ] 添加 HTTPS 支持
- [ ] 添加速率限制
- [ ] 添加 CSRF 防护

### 中优先级
- [ ] 添加单元测试
- [ ] 添加集成测试
- [ ] 添加日志系统
- [ ] 添加数据备份

### 低优先级
- [ ] 代码模块化重构
- [ ] 添加性能监控
- [ ] 添加健康检查端点

---

**修复完成时间**: 2024-10-27  
**修复内容**: 安全性、架构、错误处理

