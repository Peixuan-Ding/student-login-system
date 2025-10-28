# 🔄 Git 自动推送更新指南

> 如何通过 git 命令推送更新到 GitHub 仓库

## 📋 前置条件

1. ✅ **你的仓库地址**: https://github.com/peixuan-ding/student-login-system
2. ✅ **网站地址**: https://peixuan-ding.github.io/student-login-system/
3. ❌ **需要安装 Git for Windows**

---

## 第一步：安装 Git

### Windows 系统

1. **下载 Git for Windows**
   - 访问：https://git-scm.com/download/win
   - 点击下载 64-bit Git for Windows Setup

2. **安装 Git**
   - 运行安装程序
   - 全部选择默认选项，一路点击 "Next"
   - 完成安装

3. **验证安装**
   - 重启 PowerShell 或命令提示符
   - 运行命令：
     ```bash
     git --version
     ```
   - 如果显示版本号（如 `git version 2.40.0`），说明安装成功！

4. **配置 Git**（只需要做一次）
   ```bash
   git config --global user.name "peixuan-ding"
   git config --global user.email "your-email@example.com"
   ```
   （将邮箱替换为你的实际邮箱）

---

## 第二步：初始化 Git 仓库

打开 PowerShell，进入项目目录：

```bash
cd C:\Users\ding\Desktop\demo1027
```

### 方案A：如果这是全新的项目（未初始化git）

```bash
# 初始化 git 仓库
git init

# 添加远程仓库
git remote add origin https://github.com/peixuan-ding/student-login-system.git

# 添加所有文件
git add .

# 提交文件
git commit -m "Initial commit - 学科教学智能平台"

# 推送到 GitHub
git push -u origin main
```

### 方案B：如果 GitHub 仓库已经存在，需要覆盖

```bash
# 初始化 git 仓库
git init

# 添加远程仓库
git remote add origin https://github.com/peixuan-ding/student-login-system.git

# 添加所有文件
git add .

# 提交文件
git commit -m "Update: 更新最新版本"

# 强制推送到 GitHub（覆盖远程内容）
git push -u origin main --force
```

⚠️ **注意**：`--force` 会覆盖远程仓库的所有内容，请确保这是你想要的！

---

## 第三步：日常更新流程

以后每次修改代码后，使用以下命令更新：

```bash
# 1. 进入项目目录
cd C:\Users\ding\Desktop\demo1027

# 2. 添加所有修改的文件
git add .

# 3. 提交更改
git commit -m "Update: 描述你的更改内容"

# 4. 推送到 GitHub
git push origin main
```

---

## 🎯 完整一键更新脚本

你可以在项目根目录创建一个文件 `update.bat`：

### 创建 update.bat 文件

```batch
@echo off
echo ========================================
echo 🚀 更新项目到 GitHub
echo ========================================
echo.

cd /d %~dp0

echo 📝 添加所有文件...
git add .

echo.
echo 📦 提交更改...
git commit -m "Update: %date% %time%"

echo.
echo 🚀 推送到 GitHub...
git push origin main

echo.
echo ✅ 更新完成！
echo.
pause
```

然后双击运行 `update.bat` 即可一键更新！

---

## 🔍 检查更新状态

### 查看未提交的更改

```bash
git status
```

### 查看提交历史

```bash
git log --oneline
```

### 查看与远程的差异

```bash
git fetch
git log HEAD..origin/main
```

---

## ⚠️ 常见问题

### Q1: 推送时提示 "Authentication failed"

**解决方案**：
1. 使用个人访问令牌（Personal Access Token）替代密码
2. 访问：https://github.com/settings/tokens
3. 点击 "Generate new token" → "Generate new token (classic)"
4. 勾选 `repo` 权限
5. 复制生成的 token
6. 推送时密码输入使用 token 而非 GitHub 密码

### Q2: 推送时提示 "main 分支不存在"

**解决方案**：
```bash
# 重命名当前分支为 main
git branch -M main

# 然后推送
git push -u origin main
```

### Q3: 如何撤销最后一次提交？

```bash
# 撤销提交，但保留文件更改
git reset --soft HEAD~1

# 或者完全撤销，丢弃更改
git reset --hard HEAD~1
```

### Q4: 如何回退到之前的版本？

```bash
# 查看提交历史
git log --oneline

# 回退到指定版本（替换 COMMIT_ID）
git reset --hard COMMIT_ID

# 强制推送
git push origin main --force
```

### Q5: 如何创建新分支？

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 推送新分支
git push -u origin feature/new-feature
```

---

## 📊 推荐的 Git 工作流程

### 基本流程

```
本地修改文件
    ↓
git add .          (添加到暂存区)
    ↓
git commit -m ""   (提交到本地仓库)
    ↓
git push           (推送到 GitHub)
    ↓
GitHub Pages 自动更新（1-2分钟）
```

### 文件状态变化

```
工作区 (未跟踪)
    ↓  git add .
暂存区 (已暂存)
    ↓  git commit
本地仓库 (已提交)
    ↓  git push
远程仓库 (已推送)
```

---

## 🎨 Git 提交信息规范

建议使用清晰的提交信息：

```bash
# 功能更新
git commit -m "Add: 新增数据存储文档"

# 修复问题
git commit -m "Fix: 修复登录密码验证bug"

# 更新内容
git commit -m "Update: 更新 README 文档"

# 重构代码
git commit -m "Refactor: 优化代码结构"

# 文档更新
git commit -m "Docs: 更新部署指南"
```

---

## 🚀 快速参考命令

```bash
# 初始化仓库（仅第一次）
git init
git remote add origin https://github.com/peixuan-ding/student-login-system.git

# 日常更新流程
git add .
git commit -m "Update: 更新说明"
git push origin main

# 查看状态
git status
git log --oneline
```

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Git 官方文档：https://git-scm.com/doc
2. GitHub 文档：https://docs.github.com
3. 运行 `git help` 查看更多命令

---

**祝你使用愉快！** 🎉

