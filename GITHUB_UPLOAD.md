# 🌐 GitHub 手动部署指南

如果系统没有安装Git，或者Git命令有问题，可以使用以下方法手动上传到GitHub。

## 方法1: 通过GitHub网页上传（最简单，推荐）⭐

### 步骤1: 创建GitHub仓库
1. 访问 https://github.com
2. 登录你的账号（如果没有账号，先注册）
3. 点击右上角 "+" 按钮
4. 选择 "New repository"
5. 填写信息：
   - Repository name: `student-login-system`
   - Description: `智慧学习平台 - 学生登录系统`
   - 选择 Public（公开）
   - 不要勾选"Initialize this repository with a README"
   - 点击 "Create repository"

### 步骤2: 上传文件
创建仓库后，GitHub会自动跳转到你的新仓库页面。

#### 如果你看到"uploading your project"页面：
1. 点击 "uploading an existing file"
2. 将项目文件夹 `demo1027` 中的所有文件拖拽到浏览器窗口中
3. 在页面下方填写：
   - Commit message: `Initial commit`
4. 点击绿色按钮 "Commit changes"

#### 如果仓库已经有README.md：
1. 点击 "Add file" → "Upload files"
2. 将以下文件从你的项目文件夹拖拽上传：
   ```
   index.html
   learning-platform.html
   style.css
   script.js
   learning-platform.css
   learning-platform.js
   README.md
   QUICK_START.md
   DEPLOY.md
   deploy.bat
   deploy.sh
   .gitignore
   .gitattributes
   ```
3. 点击 "Commit changes"

### 步骤3: 启用GitHub Pages
1. 进入你的仓库页面
2. 点击顶部 "Settings"
3. 左侧菜单找到 "Pages"
4. 在 "Source" 下拉菜单中选择："Deploy from a branch"
5. Branch选择："main"，Folder选择："/ (root)"
6. 点击 "Save"

### 步骤4: 访问网站
等待1-2分钟后，访问：
```
https://YOUR_USERNAME.github.io/student-login-system/
```
（将 YOUR_USERNAME 替换为你的GitHub用户名）

---

## 方法2: 安装Git后使用命令行

如果你想使用命令行部署，需要先安装Git。

### 安装Git（Windows）

#### 下载Git
1. 访问：https://git-scm.com/download/win
2. 点击下载最新版本的Git for Windows
3. 运行安装程序
4. 全部选择默认选项，一路点击"Next"即可

#### 安装完成后
1. **重启命令提示符或PowerShell**（重要！）
2. 打开PowerShell，进入你的项目文件夹
3. 运行：
   ```bash
   cd C:\Users\ding\Desktop\demo1027
   git --version
   ```
   如果显示版本号，说明安装成功

4. 配置Git（只需要做一次）：
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

5. 然后运行部署脚本：
   ```bash
   .\deploy.bat
   ```

---

## 方法3: 使用GitHub Desktop（图形界面）

如果你不想使用命令行，可以下载GitHub Desktop：

1. 下载：https://desktop.github.com/
2. 安装并登录你的GitHub账号
3. 点击 "File" → "Add local repository"
4. 选择你的项目文件夹
5. 输入commit message，点击 "Commit to main"
6. 点击 "Publish repository"

然后在GitHub网页上启用Pages（同方法1的步骤3）

---

## ⚡ 最快的方法推荐

**推荐使用方法1（网页上传）**，因为：
- ✅ 不需要安装任何软件
- ✅ 操作简单，拖拽文件即可
- ✅ 即时上传，无需学习命令
- ✅ 出错概率低

## 📝 需要上传的文件列表

确保以下文件都已上传到GitHub：

**必需的HTML文件：**
- ✅ index.html
- ✅ learning-platform.html

**样式文件：**
- ✅ style.css
- ✅ learning-platform.css

**JavaScript文件：**
- ✅ script.js
- ✅ learning-platform.js

**文档文件（可选但推荐）：**
- ✅ README.md
- ✅ QUICK_START.md
- ✅ DEPLOY.md

**部署脚本（可选）：**
- ✅ deploy.bat
- ✅ deploy.sh

**配置文件：**
- ✅ .gitignore
- ✅ .gitattributes

## 🔧 常见问题

### Q: 上传后访问404？
A: 等待2-3分钟，GitHub Pages需要时间生成。

### Q: 为什么我看不到 .gitignore 文件？
A: 这个文件被Windows隐藏了。不影响部署，可以忽略。

### Q: 如何更新网站内容？
A: 在GitHub网页上编辑文件，或重新上传修改后的文件。

### Q: 可以上传整个文件夹吗？
A: 不可以，需要逐个拖拽文件。建议使用方法2或方法3，可以批量上传。

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 [QUICK_START.md](QUICK_START.md) 
2. 查看 [DEPLOY.md](DEPLOY.md)
3. 检查GitHub Pages设置是否正确

祝部署顺利！🎉

