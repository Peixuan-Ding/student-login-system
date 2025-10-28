# GitHub 手动上传指南

## 📝 前提条件

确保已经配置好 Git 和 GitHub：
1. 安装 Git：[https://git-scm.com/downloads](https://git-scm.com/downloads)
2. 注册 GitHub 账号：[https://github.com](https://github.com)
3. 配置 Git 用户名和邮箱：
   ```bash
   git config --global user.name "你的用户名"
   git config --global user.email "你的邮箱"
   ```

## 🚀 手动上传步骤

### 步骤 1: 初始化 Git 仓库（如果还没有）

```bash
git init
```

### 步骤 2: 添加远程仓库

在 GitHub 上创建一个新仓库（如果还没有），然后添加远程地址：

```bash
# 如果还没有远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 或者使用 SSH（如果配置了 SSH 密钥）
# git remote add origin git@github.com:你的用户名/仓库名.git

# 查看当前远程仓库
git remote -v
```

### 步骤 3: 查看当前状态

```bash
git status
```

### 步骤 4: 添加新文件到暂存区

```bash
# 添加所有新文件和更改
git add .

# 或者分别添加每个文件
git add config.example.json
git add PROJECT_STRUCTURE.md
git add database/
git add docs/
git add middleware/
git add package.json
git add public/
git add routes/
git add server.js
git add utils/
git add env.example
```

### 步骤 5: 提交更改

```bash
# 提交所有更改
git commit -m "项目重构: 添加后端服务器和配置模板"

# 或者分开提交不同类型的更改
git commit -m "添加后端服务器文件"
git commit -m "添加配置示例文件"
```

### 步骤 6: 推送到 GitHub

```bash
# 推送到 main 分支
git push -u origin main

# 如果是第一次推送并提示需要拉取
git push -u origin main --force
```

## 🔍 详细命令说明

### 查看要上传的文件

```bash
# 查看所有更改
git status

# 查看具体改动的文件
git diff
```

### 如果遇到冲突

```bash
# 1. 先拉取远程更改
git pull origin main

# 2. 解决冲突后，再次提交
git add .
git commit -m "解决冲突"
git push origin main
```

### 创建新分支推送

```bash
# 创建并切换到新分支
git checkout -b dev

# 添加并提交
git add .
git commit -m "在 dev 分支开发"

# 推送到远程
git push -u origin dev
```

## ⚠️ 常见问题

### 问题 1: 提示需要认证

**解决方案**: 在 GitHub 上生成 Personal Access Token
1. 进入 GitHub → Settings → Developer settings → Personal access tokens
2. 生成新的 token
3. 推送时使用 token 作为密码

### 问题 2: 提示 config.json 已更改

**这是正常的！** config.json 已经被 .gitignore 忽略，不会上传。

### 问题 3: 想更新已上传的文件

```bash
# 添加更改
git add .

# 提交更改
git commit -m "更新项目文件"

# 推送更改
git push origin main
```

## ✅ 验证上传成功

访问你的 GitHub 仓库链接：
```
https://github.com/你的用户名/仓库名
```

你应该能看到所有文件（除了 config.json，因为它被忽略）。

## 📦 项目结构清单

以下是应该上传的文件：

```
STT platform/
├── .gitignore              ✅ (已修改)
├── README.md               ✅ (已修改)
├── config.example.json     ✅ (新创建)
├── PROJECT_STRUCTURE.md    ✅ (新创建)
├── env.example             ✅ (示例文件)
├── package.json            ✅ (新创建)
├── server.js               ✅ (新创建)
├── database/               ✅ (新文件夹)
├── docs/                   ✅ (新文件夹)
├── middleware/              ✅ (新文件夹)
├── public/                 ✅ (新文件夹)
├── routes/                 ✅ (新文件夹)
└── utils/                  ✅ (新文件夹)

❌ config.json              (不会被上传，已忽略)
```

## 🎯 快速上传命令（一行）

如果你确定所有更改都正确，可以一次性执行：

```bash
git add . && git commit -m "项目重构: 添加后端服务器和配置模板" && git push -u origin main
```

## 💡 提示

- **config.json 已安全**: 这个文件包含你的真实 API 密钥，已经被 .gitignore 忽略，不会上传
- **config.example.json**: 这个文件会被上传，供其他用户参考配置格式
- **所有其他文件**: 都会正常上传到 GitHub

现在你可以安全地推送代码到 GitHub 了！🚀

