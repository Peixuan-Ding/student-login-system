# 学生智慧学习平台

集成 DeepSeek、Kimi、ChatGPT 和豆包 AI 模型的学习平台。

---

## 🚀 快速部署到Ubuntu云服务器

### 方式1: 一键安装（推荐）

```bash
# 1. SSH连接到服务器
ssh root@你的服务器IP

# 2. 上传项目（3种方式任选其一）
# 方式A: Git克隆
git clone <你的仓库地址>
cd STT-platform

# 方式B: SCP上传（本地执行）
scp -r 项目文件夹 root@服务器IP:/root/STT-platform

# 方式C: 使用WinSCP等FTP工具上传

# 3. 进入项目目录
cd ~/STT-platform

# 4. 一键安装环境
sudo bash install-ubuntu.sh

# 5. 配置API密钥
nano config.json
# 填入您的AI服务API密钥

# 6. 安装依赖并启动
npm install
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

### 方式2: 手动安装

详细步骤请查看：[部署指南.md](./部署指南.md)

---

## 📋 环境要求

- **操作系统**: Ubuntu 22.04 LTS（推荐）
- **内存**: 1GB（推荐2GB）
- **Node.js**: 18.x LTS
- **端口**: 3000

---

## ⚙️ 配置说明

### API配置文件 (config.json)

```json
{
  "deepseek": {
    "apiKey": "你的API密钥",
    "baseUrl": "https://api.probex.top"
  },
  "kimi": {
    "apiKey": "你的API密钥",
    "baseUrl": "https://api.probex.top"
  }
}
```

> 💡 **使用 Probex API**: 所有模型可以使用同一个 API Key

---

## 📖 详细文档

- **部署指南**: [部署指南.md](./部署指南.md) - 详细的部署步骤和故障排查
- **完整文档**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整的部署和配置文档

---

## 🔧 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs STT-Learning-Platform

# 重启服务
pm2 restart STT-Learning-Platform

# 停止服务
pm2 stop STT-Learning-Platform
```

---

## 🌐 访问应用

部署完成后访问：
- **IP访问**: `http://你的服务器IP:3000/learning-platform.html`
- **域名访问**: 配置Nginx后使用 `http://你的域名`

---

## 📦 项目结构

```
.
├── server.js              # 服务器主文件
├── config.json            # API配置文件
├── package.json           # 项目依赖
├── ecosystem.config.js    # PM2配置
├── install-ubuntu.sh      # Ubuntu环境安装脚本
├── deploy.sh              # 部署脚本
├── setup-nginx.sh         # Nginx配置脚本
├── public/                # 前端文件
├── routes/                # API路由
├── middleware/            # 中间件
└── utils/                 # 工具函数
```

---

## ✨ 功能特点

- 🤖 **多AI模型**: DeepSeek、Kimi、ChatGPT、豆包
- 📚 **内容管理**: 课程、课件、学习资源
- 💬 **智能问答**: 多轮对话，上下文理解
- 📝 **学习计划**: 个性化学习建议
- 🔍 **全文搜索**: 快速查找学习内容

---

## 🔐 安全提醒

1. ⚠️ **不要将包含真实API密钥的config.json提交到Git**
2. ✅ 生产环境建议使用环境变量 (`.env`)
3. 🔒 配置防火墙，只开放必要端口
4. 🛡️ 建议使用HTTPS（配置SSL证书）

---

## 🐛 故障排查

### 无法访问服务 ⚠️
```bash
# 检查服务状态
pm2 status

# 检查端口
sudo netstat -tulpn | grep 3000

# 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp  # 开放3000端口

# 查看详细日志
pm2 logs STT-Learning-Platform --lines 50
```

### API调用失败
```bash
# 查看错误日志
pm2 logs STT-Learning-Platform --err

# 检查API配置
cat config.json
```

### 📋 故障排查文档
- 🔧 **[故障排查.md](./故障排查.md)** - 完整的诊断流程和解决方案
- 📖 [部署指南.md](./部署指南.md) - 详细的部署步骤

---

## 📝 更新部署

```bash
# SSH连接服务器
ssh root@你的服务器IP

# 进入项目目录
cd ~/STT-platform

# 更新代码（如果使用Git）
git pull

# 或上传新文件覆盖

# 安装新依赖
npm install

# 重启服务
pm2 restart STT-Learning-Platform
```

---

## 📄 许可证

MIT

---

## 📞 获取帮助

详细部署文档：
- [部署指南.md](./部署指南.md)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
