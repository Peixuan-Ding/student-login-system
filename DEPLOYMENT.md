# 服务器部署说明

## 📋 本地已完成的操作

✅ 提交了所有更改到Git仓库  
✅ 推送到GitHub远程仓库  
✅ deploy-on-server.sh 已添加到版本控制  

## 🚀 部署到服务器的步骤

### 方法一：使用SSH连接（推荐）

1. **打开终端/命令行**（Git Bash 或 PowerShell）

2. **连接到服务器**：
   ```bash
   ssh root@120.55.74.14
   ```

3. **进入项目目录**（根据实际路径调整）：
   ```bash
   cd '/root/STT platform'
   # 或者
   cd /root/STT-platform
   # 或者  
   cd /root/student-login-system
   ```

4. **拉取最新代码**：
   ```bash
   git pull origin main
   ```

5. **安装依赖**（如果需要）：
   ```bash
   npm install multer pdf-parse mammoth
   ```

6. **确保上传目录存在**：
   ```bash
   mkdir -p uploads/tmp
   chmod 755 uploads/tmp
   ```

7. **重启服务**：
   ```bash
   pm2 restart STT-Learning-Platform
   ```

8. **检查服务状态**：
   ```bash
   pm2 status
   ```

9. **查看日志**（如果需要）：
   ```bash
   pm2 logs STT-Learning-Platform --lines 30
   ```

### 方法二：使用一键部署脚本

在服务器上执行：
```bash
bash deploy-on-server.sh
```

或者从本地执行（需要先上传脚本）：
```bash
ssh root@120.55.74.14 'cd /root && [ -d "STT platform" ] && cd "STT platform" || cd STT-platform && cd "/root/STT platform" && git pull origin main && npm install && pm2 restart STT-Learning-Platform && pm2 status'
```

### 方法三：使用自动化部署

从本地直接执行完整部署（需要在本地配置SSH密钥）：
```bash
ssh root@120.55.74.14 << 'EOF'
cd '/root/STT platform' || cd /root/STT-platform || cd /root/student-login-system
git pull origin main
npm install multer pdf-parse mammoth
mkdir -p uploads/tmp && chmod 755 uploads/tmp
pm2 restart STT-Learning-Platform
pm2 status
pm2 logs STT-Learning-Platform --lines 30 --nostream
echo "✅ 部署完成！服务地址: http://120.55.74.14:3000"
EOF
```

## ✅ 部署完成后

- 🌐 访问地址：http://120.55.74.14:3000
- 📝 查看实时日志：`pm2 logs STT-Learning-Platform`
- 🔍 检查服务状态：`pm2 status`

## 🔧 常见问题

### 如果找不到项目目录
```bash
# 列出可能的目录
ls -la /root | grep -E 'STT|student|platform'

# 或者查找PM2管理的项目路径
pm2 describe STT-Learning-Platform | grep cwd
```

### 如果git pull失败
```bash
# 检查git状态
git status

# 如果有冲突，先stash本地更改
git stash
git pull origin main
git stash pop
```

### 如果需要重置服务器代码
```bash
git fetch origin
git reset --hard origin/main
npm install
pm2 restart STT-Learning-Platform
```

## 📦 当前更新的内容

- ✅ 修改了 `.gitignore`
- ✅ 删除了临时文档和部署脚本
- ✅ 更新了 `public/learning-platform.html`
- ✅ 更新了 `public/learning-platform.js`
- ✅ 更新了 `routes/upload.js`
- ✅ 更新了数据库文件（lesson-plans.json, materials.json, resources.json）
- ✅ 添加了 `deploy-on-server.sh` 到版本控制

