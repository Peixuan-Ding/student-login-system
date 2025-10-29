# 学生智慧学习平台 - 自动部署脚本 (PowerShell版本)
# 用于将代码部署到云服务器

Write-Host "🚀 开始部署学生智慧学习平台到云服务器..." -ForegroundColor Green

# 获取服务器信息
$SERVER_IP = Read-Host "请输入服务器IP地址"
$SERVER_USER = Read-Host "请输入服务器用户名 (默认: root)"
if ([string]::IsNullOrWhiteSpace($SERVER_USER)) { $SERVER_USER = "root" }
$DEPLOY_DIR = Read-Host "请输入服务器部署目录 (默认: /root/student-login-system)"
if ([string]::IsNullOrWhiteSpace($DEPLOY_DIR)) { $DEPLOY_DIR = "/root/student-login-system" }

Write-Host "`n服务器信息:" -ForegroundColor Yellow
Write-Host "IP: $SERVER_IP"
Write-Host "用户: $SERVER_USER"
Write-Host "目录: $DEPLOY_DIR"

# 确认部署
$confirm = Read-Host "`n确认部署? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "部署已取消" -ForegroundColor Red
    exit 1
}

# 步骤1: 拉取最新代码
Write-Host "`n步骤1: 从GitHub拉取最新代码..." -ForegroundColor Green
ssh ${SERVER_USER}@${SERVER_IP} "cd $DEPLOY_DIR && git pull origin main"
Write-Host "✅ 代码已更新" -ForegroundColor Green

# 步骤2: 安装依赖
Write-Host "`n步骤2: 安装项目依赖..." -ForegroundColor Green
ssh ${SERVER_USER}@${SERVER_IP} "cd $DEPLOY_DIR && npm install"
Write-Host "✅ 依赖已安装" -ForegroundColor Green

# 步骤3: 检查文件上传目录
Write-Host "`n步骤3: 检查文件上传目录..." -ForegroundColor Green
ssh ${SERVER_USER}@${SERVER_IP} "cd $DEPLOY_DIR && if [ ! -d 'uploads/tmp' ]; then mkdir -p uploads/tmp && chmod 755 uploads/tmp; fi"
Write-Host "✅ 上传目录已就绪" -ForegroundColor Green

# 步骤4: 重启服务
Write-Host "`n步骤4: 重启应用服务..." -ForegroundColor Green
$pm2Status = ssh ${SERVER_USER}@${SERVER_IP} "pm2 list | grep STT-Learning-Platform"
if ($pm2Status) {
    ssh ${SERVER_USER}@${SERVER_IP} "cd $DEPLOY_DIR && pm2 restart STT-Learning-Platform"
    Write-Host "✅ 服务已重启" -ForegroundColor Green
} else {
    ssh ${SERVER_USER}@${SERVER_IP} "cd $DEPLOY_DIR && pm2 start ecosystem.config.js --env production && pm2 save"
    Write-Host "✅ 服务已启动" -ForegroundColor Green
}

# 步骤5: 查看服务状态
Write-Host "`n步骤5: 检查服务状态..." -ForegroundColor Green
ssh ${SERVER_USER}@${SERVER_IP} "pm2 status"

Write-Host "`n✅ 部署完成！" -ForegroundColor Green
Write-Host "`n访问地址:"
Write-Host "  http://$SERVER_IP:3000"
Write-Host "`n查看日志:"
Write-Host "  ssh $SERVER_USER@$SERVER_IP 'pm2 logs STT-Learning-Platform'"
Write-Host "`n重启服务:"
Write-Host "  ssh $SERVER_USER@$SERVER_IP 'pm2 restart STT-Learning-Platform'"

