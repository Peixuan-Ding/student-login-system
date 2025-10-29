#!/bin/bash

#############################################
# Nginx反向代理配置脚本
#############################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

echo "=========================================="
echo "   配置Nginx反向代理"
echo "=========================================="

# 安装Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${GREEN}正在安装Nginx...${NC}"
    if [ -f /etc/debian_version ]; then
        apt update
        apt install -y nginx
    elif [ -f /etc/redhat-release ]; then
        yum install -y nginx
    fi
fi

# 询问用户配置
read -p "请输入域名或IP地址 (默认: 公网IP): " SERVER_NAME
if [ -z "$SERVER_NAME" ]; then
    SERVER_NAME=$(curl -s ifconfig.me)
fi

read -p "请输入后端端口 (默认: 3000): " BACKEND_PORT
if [ -z "$BACKEND_PORT" ]; then
    BACKEND_PORT=3000
fi

# 创建Nginx配置
CONFIG_FILE="/etc/nginx/sites-available/learning-platform"

# 检测配置文件目录结构
if [ -d "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu结构
    SITES_ENABLED="/etc/nginx/sites-enabled"
else
    # CentOS/RHEL结构
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
    # 修改nginx.conf以包含sites-enabled
    if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
        sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
    fi
    SITES_ENABLED="/etc/nginx/sites-enabled"
fi

cat > $CONFIG_FILE << EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    # 日志配置
    access_log /var/log/nginx/learning-platform-access.log;
    error_log /var/log/nginx/learning-platform-error.log;

    # 增加上传大小限制
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        
        # WebSocket支持
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # 传递真实IP
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 缓存配置
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存（可选）
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://localhost:${BACKEND_PORT};
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 创建符号链接
if [ -L "${SITES_ENABLED}/learning-platform" ]; then
    rm ${SITES_ENABLED}/learning-platform
fi
ln -s $CONFIG_FILE ${SITES_ENABLED}/learning-platform

# 测试配置
echo -e "${GREEN}测试Nginx配置...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    # 重启Nginx
    echo -e "${GREEN}重启Nginx...${NC}"
    systemctl restart nginx
    systemctl enable nginx
    
    # 开放80和443端口
    echo -e "${GREEN}配置防火墙...${NC}"
    if [ -f /etc/debian_version ]; then
        ufw allow 80/tcp
        ufw allow 443/tcp
    elif [ -f /etc/redhat-release ]; then
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --reload
    fi
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "   Nginx配置完成！"
    echo "=========================================="
    echo -e "${NC}"
    echo "访问地址: http://${SERVER_NAME}"
    echo "配置文件: ${CONFIG_FILE}"
    echo ""
    echo "如需配置HTTPS，请运行:"
    echo "  sudo certbot --nginx -d ${SERVER_NAME}"
    echo ""
else
    echo -e "${RED}Nginx配置测试失败，请检查错误信息${NC}"
    exit 1
fi

