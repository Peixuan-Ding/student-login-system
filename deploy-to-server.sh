#!/bin/bash

# 学生智慧学习平台 - 自动部署脚本
# 用于将代码部署到云服务器

set -e

echo "🚀 开始部署学生智慧学习平台到云服务器..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取服务器信息
read -p "请输入服务器IP地址: " SERVER_IP
read -p "请输入服务器用户名 (默认: root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}
read -p "请输入服务器部署目录 (默认: /root/student-login-system): " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/root/student-login-system}

echo -e "${YELLOW}服务器信息:${NC}"
echo "IP: $SERVER_IP"
echo "用户: $SERVER_USER"
echo "目录: $DEPLOY_DIR"
echo ""

# 确认部署
read -p "确认部署? (y/n): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${RED}部署已取消${NC}"
    exit 1
fi

# 步骤1: 拉取最新代码
echo -e "${GREEN}步骤1: 从GitHub拉取最新代码...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /root/student-login-system
echo "当前目录: $(pwd)"
echo "拉取最新代码..."
git pull origin main
echo "✅ 代码已更新"
ENDSSH

# 步骤2: 安装依赖
echo -e "${GREEN}步骤2: 安装项目依赖...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /root/student-login-system
echo "检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo "更新依赖..."
    npm install
fi
echo "✅ 依赖已安装"
ENDSSH

# 步骤3: 检查文件上传目录
echo -e "${GREEN}步骤3: 检查文件上传目录...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /root/student-login-system
if [ ! -d "uploads/tmp" ]; then
    echo "创建上传目录..."
    mkdir -p uploads/tmp
    chmod 755 uploads/tmp
fi
echo "✅ 上传目录已就绪"
ENDSSH

# 步骤4: 重启服务
echo -e "${GREEN}步骤4: 重启应用服务...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /root/student-login-system
if pm2 list | grep -q "STT-Learning-Platform"; then
    echo "服务已存在，正在重启..."
    pm2 restart STT-Learning-Platform
else
    echo "服务不存在，正在启动..."
    pm2 start ecosystem.config.js --env production
    pm2 save
fi
echo "✅ 服务已重启"
ENDSSH

# 步骤5: 查看服务状态
echo -e "${GREEN}步骤5: 检查服务状态...${NC}"
ssh $SERVER_USER@$SERVER_IP 'pm2 status'

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "访问地址:"
echo "  http://$SERVER_IP:3000"
echo ""
echo "查看日志:"
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 logs STT-Learning-Platform'"
echo ""
echo "重启服务:"
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 restart STT-Learning-Platform'"
echo ""

