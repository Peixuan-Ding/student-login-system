#!/bin/bash

#############################################
# Ubuntu 22.04 服务器环境安装脚本
# 适用于全新的Ubuntu 22.04系统
#############################################

set -e  # 遇到错误立即退出

echo "=========================================="
echo "   Ubuntu 22.04 环境配置"
echo "   学生智慧学习平台"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本: sudo bash install-ubuntu.sh${NC}"
    exit 1
fi

# 检查系统版本
echo -e "\n${BLUE}检查系统版本...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "系统: $NAME $VERSION"
    if [[ "$VERSION" != "22.04" ]]; then
        echo -e "${YELLOW}警告: 此脚本主要针对Ubuntu 22.04，其他版本可能存在兼容性问题${NC}"
    fi
fi

# 更新系统
echo -e "\n${GREEN}[1/10] 更新系统包列表...${NC}"
apt update && apt upgrade -y

# 安装基础工具
echo -e "\n${GREEN}[2/10] 安装基础工具...${NC}"
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    ufw \
    build-essential

# 安装Node.js 18.x LTS
echo -e "\n${GREEN}[3/10] 安装Node.js...${NC}"
if command -v node &> /dev/null; then
    echo "Node.js已安装，版本: $(node -v)"
else
    echo "正在安装Node.js 18.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo "Node.js安装完成: $(node -v)"
fi

# 验证Node.js和npm
echo -e "\n${GREEN}验证Node.js和npm...${NC}"
node --version
npm --version

# 安装PM2
echo -e "\n${GREEN}[4/10] 安装PM2进程管理器...${NC}"
if command -v pm2 &> /dev/null; then
    echo "PM2已安装，版本: $(pm2 --version)"
else
    npm install -g pm2
    echo "PM2安装完成: $(pm2 --version)"
fi

# 安装Nginx（可选，用于反向代理）
echo -e "\n${GREEN}[5/10] 安装Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo "Nginx已安装"
else
    apt install -y nginx
    systemctl enable nginx
    echo "Nginx安装完成"
fi

# 配置防火墙
echo -e "\n${GREEN}[6/10] 配置防火墙...${NC}"
# 设置UFW默认策略
ufw --force enable
ufw default deny incoming
ufw default allow outgoing

# 允许SSH
ufw allow 22/tcp

# 允许应用端口
ufw allow 3000/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo "防火墙规则:"
ufw status verbose

# 安装额外的系统依赖
echo -e "\n${GREEN}[7/10] 安装系统依赖...${NC}"
apt install -y \
    python3 \
    python3-pip

# 创建必要的目录
echo -e "\n${GREEN}[8/10] 创建项目目录...${NC}"
mkdir -p /root/STT-platform
mkdir -p /root/STT-platform/logs
chmod 755 /root/STT-platform/logs

# 配置bashrc优化
echo -e "\n${GREEN}[9/10] 优化shell配置...${NC}"
if ! grep -q "alias ll" /root/.bashrc; then
    echo 'alias ll="ls -alF"' >> /root/.bashrc
    echo 'alias la="ls -A"' >> /root/.bashrc
    echo 'alias l="ls -CF"' >> /root/.bashrc
fi

# 清理缓存
echo -e "\n${GREEN}[10/10] 清理系统缓存...${NC}"
apt autoremove -y
apt autoclean

# 显示系统信息
echo -e "\n${BLUE}=========================================="
echo "   环境配置完成！"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}已安装的软件:${NC}"
echo "  - Node.js: $(node -v)"
echo "  - npm: $(npm -v)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1 | head -1)"
echo ""
echo -e "${GREEN}当前服务器IP:${NC}"
ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' || echo "无法获取IP"
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo "  1. 上传项目到服务器"
echo "  2. 进入项目目录: cd /root/STT-platform"
echo "  3. 安装项目依赖: npm install"
echo "  4. 配置API密钥: nano .env 或 nano config.json"
echo "  5. 启动服务: pm2 start ecosystem.config.js --env production"
echo "  6. 设置开机自启动: pm2 startup && pm2 save"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo "  - 查看服务状态: pm2 status"
echo "  - 查看服务日志: pm2 logs"
echo "  - 重启服务: pm2 restart STT-Learning-Platform"
echo "  - 查看Nginx状态: systemctl status nginx"
echo "  - 测试Nginx配置: nginx -t"
echo ""
echo -e "${YELLOW}上传项目方式:${NC}"
echo "  方式1: 使用Git"
echo "    cd /root && git clone <你的仓库地址>"
echo ""
echo "  方式2: 使用SCP（本地执行）"
echo "    scp -r 项目目录 root@服务器IP:/root/STT-platform/"
echo ""
echo "  方式3: 使用WinSCP等FTP工具"
echo ""

