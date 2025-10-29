# 云服务器部署指南

本指南将帮助您将学生智慧学习平台部署到云服务器上，使其可以通过公网IP访问。

## 📋 部署前准备

### 1. 云服务器要求
- **操作系统**: Ubuntu 18.04+ / CentOS 7+ / 或其他Linux发行版
- **内存**: 至少 1GB RAM
- **CPU**: 1核以上
- **端口**: 确保防火墙开放 3000 端口（或您自定义的端口）

### 2. 本地准备工作
- 确保项目可以正常运行
- 准备好各个AI服务的API密钥

---

## 🚀 部署步骤

### 方法一：使用PM2（推荐）

#### 1️⃣ 上传项目到服务器

**选项A: 使用Git（推荐）**
```bash
# 在服务器上执行
cd ~
git clone <你的仓库地址>
cd STT-platform  # 或你的项目目录名
```

**选项B: 使用SCP上传**
```bash
# 在本地执行
scp -r "D:\Ding\STT platform" root@你的服务器IP:~/
# 或压缩后上传
```

**选项C: 使用FTP工具（如WinSCP）**
- 连接到云服务器
- 上传整个项目文件夹

#### 2️⃣ 安装Node.js和PM2

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y    # CentOS

# 安装Node.js（如果未安装）
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v

# 安装PM2（全局）
sudo npm install -g pm2

# 安装项目依赖
cd ~/STT-platform  # 切换到你的项目目录
npm install
```

#### 3️⃣ 配置环境变量

创建 `.env` 文件：
```bash
nano .env
```

复制以下内容并填入您的API密钥：
```env
# JWT密钥
JWT_SECRET=你的强随机密钥（至少32字符）

# AI API 密钥
DEEPSEEK_API_KEY=你的DeepSeek密钥
KIMI_API_KEY=你的Kimi密钥
OPENAI_API_KEY=你的OpenAI密钥
DOUBAO_API_KEY=你的豆包密钥

# 服务器配置
PORT=3000
NODE_ENV=production
```

或者使用 `config.json` 配置：
```bash
nano config.json
```
填入您的API密钥。

#### 4️⃣ 启动服务

```bash
# 使用PM2启动
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs STT-Learning-Platform

# 设置为开机自启动
pm2 startup
pm2 save
```

#### 5️⃣ 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### 6️⃣ 访问服务

在浏览器中访问：
```
http://你的云服务器公网IP:3000
```

---

## 🔧 方法二：使用Nginx反向代理（可选，推荐用于生产环境）

### 为什么使用Nginx？
- ✅ 提供HTTPS支持
- ✅ 更好的性能
- ✅ 可以多个服务共享80端口
- ✅ 更专业的部署方式

### 安装和配置Nginx

```bash
# 安装Nginx
sudo apt install nginx -y  # Ubuntu/Debian
# 或
sudo yum install nginx -y  # CentOS

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/learning-platform
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name 你的域名 或 你的公网IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 7d;
    }
}
```

启用配置：
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/learning-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 开放80端口

```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443

# CentOS
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

现在可以通过 `http://你的公网IP` 访问服务。

---

## 🔒 SSL/HTTPS配置（可选）

### 使用Let's Encrypt免费SSL证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu/Debian

# 获取证书（需要域名）
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 常用PM2命令

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs STT-Learning-Platform

# 重启服务
pm2 restart STT-Learning-Platform

# 停止服务
pm2 stop STT-Learning-Platform

# 删除服务
pm2 delete STT-Learning-Platform

# 查看监控
pm2 monit

# 查看详细信息
pm2 info STT-Learning-Platform

# 重新加载配置（零停机）
pm2 reload STT-Learning-Platform
```

---

## 🛠️ 故障排查

### 服务无法访问

1. **检查服务是否运行**
```bash
pm2 status
curl http://localhost:3000
```

2. **检查端口占用**
```bash
sudo netstat -tulpn | grep 3000
# 或
sudo lsof -i :3000
```

3. **检查防火墙**
```bash
sudo ufw status  # Ubuntu/Debian
# 或
sudo firewall-cmd --list-all  # CentOS
```

4. **查看错误日志**
```bash
pm2 logs STT-Learning-Platform --err
tail -f logs/pm2-error.log
```

### 常见问题

**Q: 端口已被占用**
```bash
# 方法1: 修改端口
# 编辑 ecosystem.config.js，修改 PORT
pm2 restart STT-Learning-Platform

# 方法2: 停止占用端口的服务
sudo fuser -k 3000/tcp
```

**Q: 无法连接数据库**
- 检查 `database/` 目录权限
```bash
chmod 755 database/
chmod 644 database/*.json
```

**Q: API调用失败**
- 检查API密钥配置是否正确
- 查看错误日志：`pm2 logs STT-Learning-Platform`

---

## 📦 更新部署

### 方式一：使用Git

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖（如果有）
npm install

# 重启服务
pm2 restart STT-Learning-Platform
```

### 方式二：重新上传

```bash
# 停止服务
pm2 stop STT-Learning-Platform

# 删除旧文件（保留 .env 和 config.json）
rm -rf node_modules
rm package-lock.json

# 上传新文件后
npm install
pm2 start ecosystem.config.js --env production
```

---

## 🔐 安全建议

1. **使用强密码**
   - 修改服务器root密码
   - 使用SSH密钥登录

2. **保护敏感信息**
   - 永远不要在代码中硬编码API密钥
   - 使用环境变量或 `.env` 文件
   - 不要将 `.env` 提交到Git

3. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y  # Ubuntu
   ```

4. **启用防火墙**
   - 只开放必要端口
   - 限制SSH访问IP

5. **使用HTTPS**
   - 为域名配置SSL证书
   - 强制HTTPS访问

6. **备份数据**
   ```bash
   # 备份数据库目录
   tar -czf backup-$(date +%Y%m%d).tar.gz database/
   ```

---

## 📝 部署检查清单

- [ ] 服务器已安装Node.js
- [ ] 已安装PM2
- [ ] 项目依赖已安装（npm install）
- [ ] 已配置环境变量（.env或config.json）
- [ ] 已启动PM2服务
- [ ] 防火墙已开放必要端口
- [ ] 可以通过公网IP访问
- [ ] 已配置Nginx（可选）
- [ ] 已配置SSL证书（可选）
- [ ] 已设置开机自启动
- [ ] 已备份敏感数据

---

## 💡 高级配置

### 自定义域名

1. 在域名注册商处添加A记录：
   - 主机名: `@` 或 `www`
   - 记录值: 你的云服务器公网IP
   - TTL: 默认

2. 等待DNS解析（几分钟到几小时）

3. 修改Nginx配置中的server_name

### 性能优化

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'STT-Learning-Platform',
    script: './server.js',
    instances: 2,  // 使用2个实例
    exec_mode: 'cluster',  // 集群模式
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',  // 内存限制
    // ... 其他配置
  }]
};
```

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. PM2日志: `pm2 logs`
2. Nginx错误日志: `sudo tail -f /var/log/nginx/error.log`
3. 系统日志: `sudo journalctl -u nginx`

---

**祝部署顺利！** 🎉

