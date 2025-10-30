# 学生智慧学习平台

集成 DeepSeek、Kimi、ChatGPT 和豆包 AI 模型的学习平台。

---

## ⚡ 一键部署（极简示例）

Linux/Mac：
```bash
./deploy.sh --mode local --host 你的服务器IP --user root --path /root/STT-platform --port 3000 --app STT-Learning-Platform
```

Windows（PowerShell）：
```powershell
./deploy.ps1 -Mode local -RemoteHost 你的服务器IP -RemoteUser root -RemotePath /root/STT-platform -RemotePort 3000 -AppName STT-Learning-Platform
```

更多参数说明见 `DEPLOYMENT.md`。

## 🚀 快速部署（统一脚本）

Linux/Mac（本地 → 服务器）：
```bash
./deploy.sh --mode local --host 你的服务器IP --user root --path /root/STT-platform --port 3000 --app STT-Learning-Platform
```

Windows（PowerShell，本地 → 服务器）：
```powershell
./deploy.ps1 -Mode local -RemoteHost 你的服务器IP -RemoteUser root -RemotePath /root/STT-platform -RemotePort 3000 -AppName STT-Learning-Platform
```

服务器内自更新（不上传代码）：
```bash
# Linux/Mac（在服务器上执行）
./deploy.sh --mode server --path /root/STT-platform --app STT-Learning-Platform
```
```powershell
# Windows（在服务器上执行）
./deploy.ps1 -Mode server -RemotePath /root/STT-platform -AppName STT-Learning-Platform
```

更多说明见：`DEPLOYMENT.md`

---

## 📥 手动安装

详细步骤请查看：[docs/部署指南.md](./docs/部署指南.md) - 包含完整的本地启动和服务器部署说明

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

- **📘 部署指南（统一版）**: [docs/部署指南.md](./docs/部署指南.md) - 本地启动、统一部署脚本与排错
- **🗃️ 数据库说明**: [docs/数据库说明.md](./docs/数据库说明.md) - 数据文件结构、接口映射与示例

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
├── install-ubuntu.sh      # Ubuntu环境安装脚本（可选）
├── deploy.sh              # 统一部署脚本（Linux/Mac）
├── deploy.ps1             # 统一部署脚本（Windows）
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
- 📖 [docs/部署指南.md](./docs/部署指南.md) - 统一部署与故障排查

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
- [docs/部署指南.md](./docs/部署指南.md) - **完整部署指南（推荐）** - 包含本地启动和服务器部署
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 服务器部署说明
- [docs/快速部署-云服务器.md](./docs/快速部署-云服务器.md) - 快速部署指南
