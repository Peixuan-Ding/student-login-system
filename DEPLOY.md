# 项目部署指南

本指南提供了几种将学生登录系统部署到服务器的方案，从最简单到最灵活。

## 方案一：GitHub Pages（推荐，免费且简单）

### 优点
- ✅ 完全免费
- ✅ 设置简单
- ✅ 自动部署
- ✅ 支持自定义域名

### 部署步骤

#### 1. 创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角 "+" 号，选择 "New repository"
3. 输入仓库名称（例如：`student-login-system`）
4. 选择 Public（公开）或 Private（私有）
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

#### 2. 上传代码到 GitHub

在项目文件夹中打开终端/命令行，执行以下命令：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Student login system"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/student-login-system.git

# 推送代码
git branch -M main
git push -u origin main
```

#### 3. 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings"（设置）
2. 在左侧菜单找到 "Pages"
3. 在 "Source" 部分，选择 "Deploy from a branch"
4. 选择 "main" 分支和 "/ (root)" 文件夹
5. 点击 "Save"
6. 等待几分钟，你会看到绿色的提示：`Your site is live at https://YOUR_USERNAME.github.io/student-login-system/`

#### 4. 访问你的网站

网站地址格式：`https://YOUR_USERNAME.github.io/student-login-system/`

访问你的网站，如果页面显示正常，说明部署成功！

### 自定义域名（可选）

1. 在仓库的 Pages 设置中找到 "Custom domain"
2. 输入你的域名（例如：`login.yourdomain.com`）
3. 在你的域名 DNS 设置中添加 CNAME 记录，指向 `YOUR_USERNAME.github.io`
4. 等待 DNS 生效（可能需要几小时）

### 更新网站

每次修改代码后，执行以下命令更新网站：

```bash
git add .
git commit -m "Update: 描述你的修改"
git push
```

GitHub Pages 会自动重新部署，通常几分钟后就能看到更新。

---

## 方案二：Netlify（推荐，功能强大）

### 优点
- ✅ 免费套餐
- ✅ 自动部署（从 GitHub）
- ✅ 自定义域名
- ✅ HTTPS 自动配置
- ✅ 更快的加载速度

### 部署步骤

#### 1. 确保代码已上传到 GitHub

参考方案一的步骤 1-2

#### 2. 注册 Netlify 账户

1. 访问 https://www.netlify.com
2. 点击 "Sign up" 注册
3. 选择 "Sign up with GitHub"，使用 GitHub 账户登录
4. 授权 Netlify 访问你的 GitHub 仓库

#### 3. 部署网站

1. 登录 Netlify 后，点击 "Add new site" > "Import an existing project"
2. 选择 "Deploy with GitHub"
3. 选择你的仓库（student-login-system）
4. 在部署设置中：
   - Build command: 留空（因为是静态网站）
   - Publish directory: `./`（根目录）
5. 点击 "Deploy site"
6. 等待部署完成（通常 1-2 分钟）

#### 4. 自定义域名

1. 在网站设置中找到 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照提示配置 DNS 设置
5. SSL/TLS 证书会自动配置

### 自动部署

每次你向 GitHub 推送代码，Netlify 会自动重新部署网站。

---

## 方案三：Vercel

### 优点
- ✅ 免费且快速
- ✅ 自动部署
- ✅ 优秀的前端支持

### 部署步骤

1. 访问 https://vercel.com
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"
6. 等待部署完成

---

## 方案四：传统服务器部署

### 使用场景
- 需要完整的服务器控制
- 需要后端支持
- 企业级应用

### 部署步骤

#### 1. 购买服务器

推荐云服务商：
- **阿里云**：https://www.aliyun.com
- **腾讯云**：https://cloud.tencent.com
- **华为云**：https://www.huaweicloud.com
- **AWS**：https://aws.amazon.com
- **DigitalOcean**：https://www.digitalocean.com

#### 2. 连接到服务器

使用 SSH 连接到你的服务器：

```bash
ssh username@your-server-ip
```

#### 3. 安装 Nginx 或 Apache

**Nginx（推荐）：**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4. 上传项目文件

将项目文件上传到服务器的网站目录：

```bash
# Nginx 默认网站目录
/var/www/html/

# 上传文件（使用 SCP 或 FTP）
scp -r * username@your-server-ip:/var/www/html/
```

#### 5. 配置域名

编辑 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/default
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

重启 Nginx：

```bash
sudo systemctl restart nginx
```

#### 6. 配置域名 DNS

在你的域名注册商处配置 DNS：
- 添加 A 记录，指向服务器 IP

#### 7. 配置 SSL（HTTPS）

安装 Certbot：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

这会自动配置 HTTPS。

---

## 方案五：使用 Docker 部署

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine

# 复制项目文件到 nginx 目录
COPY . /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t student-login-system .

# 运行容器
docker run -d -p 80:80 student-login-system
```

### 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "80:80"
    volumes:
      - ./:/usr/share/nginx/html
```

运行：

```bash
docker-compose up -d
```

---

## 方案对比

| 方案 | 难度 | 成本 | 适用场景 |
|------|------|------|----------|
| GitHub Pages | ⭐ 简单 | 免费 | 个人项目、快速部署 |
| Netlify | ⭐⭐ 中等 | 免费/付费 | 现代化应用、CI/CD |
| Vercel | ⭐⭐ 中等 | 免费/付费 | 前端项目 |
| 传统服务器 | ⭐⭐⭐ 困难 | 付费 | 企业应用、完整控制 |
| Docker | ⭐⭐⭐ 较难 | 付费 | 容器化部署 |

---

## 部署后的注意事项

### 1. 数据存储

⚠️ **重要**：当前项目使用 `localStorage` 存储数据，这意味着：
- 每个浏览器的数据是独立的
- 清除浏览器缓存会丢失数据
- 不同电脑之间数据不同步

如果需要真正的数据同步，需要：
- 添加后端服务器
- 使用数据库（MySQL、MongoDB 等）
- 实现 API 接口

### 2. 性能优化

- 压缩 CSS 和 JavaScript 文件
- 优化图片大小
- 启用浏览器缓存
- 使用 CDN 加速静态资源

### 3. 安全性

⚠️ **注意**：这是一个演示系统，不适用于生产环境：

- 需要实现真正的密码加密
- 添加 HTTPS（已包含在大部分方案中）
- 实现防暴力破解机制
- 添加用户会话管理
- 使用安全的认证机制（OAuth、JWT 等）

### 4. 监控和维护

- 定期检查网站是否正常运行
- 监控服务器资源使用情况
- 备份数据库（如果有）
- 更新依赖包以修复安全漏洞

---

## 快速部署脚本

创建一个自动化部署脚本可以简化部署过程：

### Windows (PowerShell) 部署脚本

创建 `deploy.ps1`：

```powershell
# GitHub Pages 部署脚本
Write-Host "开始部署到 GitHub Pages..." -ForegroundColor Green

# 检查 Git 是否安装
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未安装 Git" -ForegroundColor Red
    exit 1
}

# 添加所有更改
git add .
Write-Host "✓ 已添加所有文件" -ForegroundColor Green

# 提交更改
$message = Read-Host "请输入提交信息（或按 Enter 使用默认消息）"
if ($message -eq "") {
    $message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
git commit -m $message
Write-Host "✓ 已提交更改" -ForegroundColor Green

# 推送到 GitHub
git push
Write-Host "✓ 已推送到 GitHub" -ForegroundColor Green
Write-Host "网站会在几分钟内自动更新！" -ForegroundColor Yellow
```

### Linux/Mac 部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "🚀 开始部署到 GitHub Pages..."

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未安装 Git"
    exit 1
fi

# 添加所有更改
git add .
echo "✓ 已添加所有文件"

# 提交更改
read -p "请输入提交信息（或按 Enter 使用默认消息）: " message
if [ -z "$message" ]; then
    message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$message"
echo "✓ 已提交更改"

# 推送到 GitHub
git push
echo "✓ 已推送到 GitHub"
echo "🎉 网站会在几分钟内自动更新！"
```

使用前需要给脚本添加执行权限：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 故障排除

### 问题 1：页面显示 "404 Not Found"
- 检查文件路径是否正确
- 确认 `index.html` 在根目录
- 检查部署平台设置

### 问题 2：样式不显示
- 检查 CSS 文件路径
- 确认文件已上传
- 清除浏览器缓存

### 问题 3：Git 推送到 GitHub 失败
- 检查网络连接
- 确认 GitHub 凭证设置正确
- 使用 `git push -u origin main --force`（谨慎使用）

### 问题 4：域名不工作
- 检查 DNS 设置
- 等待 DNS 生效（最多 48 小时）
- 确认 SSL 证书已正确配置

---

## 需要帮助？

如果遇到问题，可以：
1. 查看平台官方文档
2. 在 GitHub Issues 中提问
3. 联系技术支持

祝部署顺利！🎉

