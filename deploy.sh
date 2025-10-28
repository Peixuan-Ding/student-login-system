#!/bin/bash

echo "========================================"
echo "  GitHub Pages 自动部署脚本"
echo "========================================"
echo ""

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "[错误] 未检测到 Git，请先安装 Git"
    echo "下载地址: https://git-scm.com/downloads"
    exit 1
fi

echo "[✓] Git 已安装"
echo ""

# 检查是否在 Git 仓库中
if ! git status &> /dev/null; then
    echo "[错误] 当前目录不是 Git 仓库"
    echo ""
    echo "提示: 请先初始化 Git 并添加远程仓库"
    echo ""
    echo "执行以下命令:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "  git push -u origin main"
    echo ""
    exit 1
fi

# 显示当前状态
echo "[信息] 当前 Git 状态:"
git status --short
echo ""

# 询问是否继续
read -p "是否继续部署？(Y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "已取消部署"
    exit 0
fi

echo ""
echo "[步骤 1] 添加所有更改..."
git add .
if [ $? -ne 0 ]; then
    echo "[错误] 添加文件失败"
    exit 1
fi
echo "[✓] 文件已添加到暂存区"
echo ""

# 提交更改
echo "[步骤 2] 提交更改..."
read -p "请输入提交信息（直接回车使用默认信息）: " message
if [ -z "$message" ]; then
    message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$message"
if [ $? -ne 0 ]; then
    echo "[警告] 没有新更改需要提交"
    echo "[✓] 尝试直接推送..."
    git push
else
    echo "[✓] 已提交更改"
    echo ""
    echo "[步骤 3] 推送到 GitHub..."
    git push
fi

if [ $? -ne 0 ]; then
    echo "[错误] 推送到 GitHub 失败"
    echo ""
    echo "提示: 请检查:"
    echo "  1. 是否已设置远程仓库"
    echo "  2. 网络连接是否正常"
    echo "  3. GitHub 凭证是否正确"
    exit 1
fi

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "[✓] 代码已推送到 GitHub"
echo "[✓] GitHub Pages 会在几分钟内自动更新"
echo ""
echo "提示:"
echo "  - 网站地址: https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo "  - 查看状态: GitHub 仓库的 Pages 设置"
echo "  - 通常 1-3 分钟后网站会自动更新"
echo ""

