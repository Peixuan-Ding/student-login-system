#!/bin/bash

# 自动部署脚本 - 在云服务器上运行
# 使用方法: ssh root@120.55.74.14 'bash -s' < deploy-on-server.sh

echo "🚀 开始部署学生登录系统..."

# 自动检测项目目录
PROJECT_DIR=""
POSSIBLE_DIRS=(
    "/root/student-login-system"
    "/root/STT-platform"
    "/root/STT platform"
    "$(pm2 describe STT-Learning-Platform 2>/dev/null | grep 'cwd' | awk '{print $4}' | head -1)"
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -n "$dir" ] && [ -d "$dir" ] && [ -f "$dir/server.js" ]; then
        PROJECT_DIR="$dir"
        echo "✅ 找到项目目录: $PROJECT_DIR"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "❌ 未找到项目目录，请手动指定："
    echo "可能的路径："
    ls -la /root/ | grep -E 'STT|student|platform' || echo "  未找到相关目录"
    read -p "请输入项目路径: " PROJECT_DIR
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "❌ 目录不存在: $PROJECT_DIR"
        exit 1
    fi
fi

# 进入项目目录
cd "$PROJECT_DIR" || exit 1
echo "📂 当前目录: $(pwd)"

echo "📦 拉取最新代码..."
git pull origin main

echo "📥 安装依赖包..."
npm install multer pdf-parse mammoth

echo "📁 创建上传目录..."
mkdir -p uploads/tmp
chmod 755 uploads/tmp

echo "🔄 重启服务..."
pm2 restart STT-Learning-Platform

echo "✅ 检查服务状态..."
pm2 status

echo "📋 查看最近日志..."
pm2 logs STT-Learning-Platform --lines 30 --nostream

echo ""
echo "✨ 部署完成！"
echo "🌐 服务地址: http://120.55.74.14:3000"
echo "📝 查看实时日志: pm2 logs STT-Learning-Platform"

