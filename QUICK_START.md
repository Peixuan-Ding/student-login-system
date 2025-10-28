# 🚀 快速开始：5分钟部署你的网站

## 最简单的部署方法

### 方法一：GitHub Pages（适合所有人）

#### 1. 创建 GitHub 账户
- 访问 https://github.com
- 如果还没有账户，点击 "Sign up" 注册

#### 2. 创建新仓库
- 登录后，点击右上角 "+" 号
- 选择 "New repository"
- 仓库名：输入 `student-login-system`（或任何你喜欢的名字）
- 选择 Public（公开）
- **不要勾选** "Initialize this repository with a README"
- 点击 "Create repository"

#### 3. 上传代码到 GitHub

**如果你熟悉命令行：**

在项目文件夹中打开终端，执行：

```bash
git init
git add .
git commit -m "Initial commit: Student login system"
git remote add origin https://github.com/YOUR_USERNAME/student-login-system.git
git branch -M main
git push -u origin main
```

**或者使用一键部署脚本：**

双击运行 `deploy.bat`（Windows）或 `deploy.sh`（Mac/Linux）

#### 4. 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击右上角的 "Settings"（设置）
2. 在左侧菜单最下方找到 "Pages"
3. 在 "Source" 部分：
   - 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - Folder 选择 "/ (root)"
   - 点击 "Save"
4. 等待 1-2 分钟，你会看到：
   ```
   Your site is live at https://YOUR_USERNAME.github.io/student-login-system/
   ```

#### 5. 访问你的网站！

打开上面显示的网址，你的网站就已经在线了！🎉

---

## 之后如何更新网站？

每当你修改代码后，只需要：

**方法 1：使用一键部署脚本**
- 双击运行 `deploy.bat`（Windows）或 `deploy.sh`（Mac/Linux）

**方法 2：手动执行 Git 命令**
```bash
git add .
git commit -m "Update: 描述你的修改"
git push
```

等待几分钟后，网站就会自动更新。

---

## 方法二：Netlify（更强大）

如果你想要更多的功能（自定义域名、自动 HTTPS 等），可以使用 Netlify。

### 步骤：

1. 首先确保代码已经上传到 GitHub（参考上面）

2. 访问 https://www.netlify.com

3. 点击 "Sign up"，选择 "Sign up with GitHub"

4. 点击 "Add new site" > "Import an existing project"

5. 选择你的 GitHub 仓库

6. 在部署设置中：
   - Build command: **留空**
   - Publish directory: `./`（或留空）
   - 点击 "Deploy site"

7. 等待部署完成（约 1 分钟）

8. 你会得到一个类似 `https://your-project-name.netlify.app` 的网址

9. 完成！🎉

---

## 常见问题

### Q: 我已经有 GitHub 账户了，还需要做什么？
A: 只需要创建新仓库并上传代码即可。

### Q: 网站部署后需要多久才能访问？
A: GitHub Pages 通常 1-3 分钟即可访问。第一次部署可能需要 10 分钟。

### Q: 我可以使用自己的域名吗？
A: 可以！在 GitHub Pages 设置中找到 "Custom domain"，输入你的域名并配置 DNS 即可。Netlify 的域名配置会更简单一些。

### Q: 网站是免费的吗？
A: 是的！GitHub Pages 和 Netlify 的基本套餐都是免费的。

### Q: 如何删除网站？
A: 在 GitHub 仓库设置中关闭 Pages 功能即可。代码依然保留在你的仓库中。

### Q: 支持 HTTPS 吗？
A: 支持！GitHub Pages 和 Netlify 都自动提供免费的 HTTPS 证书。

### Q: 可以部署私有仓库吗？
A: GitHub Pages 只支持公开仓库。如果需要私有部署，建议使用 Netlify 或 Vercel。

---

## 需要帮助？

- 📖 查看完整的部署指南：[DEPLOY.md](DEPLOY.md)
- 💬 遇到问题？检查 [DEPLOY.md](DEPLOY.md) 中的故障排除部分
- 📧 如果还是无法解决，可以在 GitHub 创建 Issue

祝部署顺利！🎊

