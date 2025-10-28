# 🔧 安装和启动指南

## 快速开始

### 1. 安装依赖

项目已添加了新的安全功能，需要安装额外依赖：

```bash
npm install
```

如果出现错误，请确保：
- ✅ 已安装 Node.js (推荐 v16+)
- ✅ 已安装 npm（通常随 Node.js 安装）
- ✅ 在项目根目录执行命令

### 2. 配置环境变量（可选）

创建 `.env` 文件（可选，如果使用 config.json 可跳过）：

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

编辑 `.env` 文件，设置你的配置：

```env
# JWT 密钥（生产环境请使用强随机字符串）
JWT_SECRET=your-secret-key-change-this-in-production

# API 密钥（可选，也可以使用 config.json）
DEEPSEEK_API_KEY=sk-xxxxx
KIMI_API_KEY=your-kimi-key
```

### 3. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 4. 打开浏览器

访问 `http://localhost:3000` 即可使用。

---

## 📝 主要改进

### ✅ 安全性
- 密码使用 bcrypt 加密
- JWT token 会话管理
- API 密钥支持环境变量
- 输入验证防止注入攻击

### ✅ 架构
- 修复 API 自调用问题
- 改善错误处理
- 移除硬编码配置

### ✅ 用户体验
- 自动错误提示
- 更好的安全性
- 向后兼容旧密码

---

## 🔑 登录测试

默认测试账户：
- **学号**: `12345678`
- **密码**: `abcdef`

---

## 📚 更多信息

- 详细修复说明：查看 `FIXES_APPLIED.md`
- 设计问题分析：查看 `DESIGN_ISSUES.md`
- API 文档：查看 `README.md`

---

## ❓ 常见问题

### Q: npm install 失败？
A: 确保 Node.js 版本 >= 16，然后重试。

### Q: 密码加密后还能登录吗？
A: 可以！旧明文密码会在首次登录时自动升级为加密密码。

### Q: 如何修改端口？
A: 设置环境变量 `PORT=8080` 或修改 `.env` 文件。

### Q: API 密钥应该放在哪里？
A: **生产环境**建议使用 `.env` 文件（需添加到 .gitignore），**开发环境**可使用 `config.json`。

---

**祝你使用愉快！** 🚀

