@echo off
chcp 65001 >nul
echo ========================================
echo  GitHub Pages 自动部署脚本
echo ========================================
echo.

:: 检查 Git 是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ========================================
    echo [错误] 未检测到 Git
    echo ========================================
    echo.
    echo 你的系统中没有安装 Git。有以下三种解决方案：
    echo.
    echo [方案1] 手动上传到GitHub（推荐，最简单）⭐⭐⭐
    echo   查看文件: GITHUB_UPLOAD.md
    echo   步骤: 在GitHub网页上拖拽文件即可
    echo.
    echo [方案2] 安装Git后使用命令行
    echo   下载: https://git-scm.com/download/win
    echo   安装后重启PowerShell，再次运行此脚本
    echo.
    echo [方案3] 使用GitHub Desktop（图形界面）
    echo   下载: https://desktop.github.com/
    echo.
    echo ========================================
    echo.
    start GITHUB_UPLOAD.md
    pause
    exit /b 1
)

echo [✓] Git 已安装
echo.

:: 检查是否在 Git 仓库中
git status >nul 2>&1
if errorlevel 1 (
    echo [错误] 当前目录不是 Git 仓库
    echo.
    echo 提示: 请先初始化 Git 并添加远程仓库
    echo.
    echo 执行以下命令:
    echo   git init
    echo   git add .
    echo   git commit -m "Initial commit"
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
)

:: 显示当前状态
echo [信息] 当前 Git 状态:
git status --short
echo.

:: 询问是否继续
set /p confirm="是否继续部署？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消部署
    pause
    exit /b 0
)

echo.
echo [步骤 1] 添加所有更改...
git add .
if errorlevel 1 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)
echo [✓] 文件已添加到暂存区
echo.

:: 提交更改
echo [步骤 2] 提交更改...
set /p message="请输入提交信息（直接回车使用默认信息）: "
if "%message%"=="" (
    set message=Update: %date% %time%
)
git commit -m "%message%"
if errorlevel 1 (
    echo [警告] 没有新更改需要提交
    echo [✓] 尝试直接推送...
    git push
) else (
    echo [✓] 已提交更改
    echo.
    echo [步骤 3] 推送到 GitHub...
    git push
)
if errorlevel 1 (
    echo [错误] 推送到 GitHub 失败
    echo.
    echo 提示: 请检查:
    echo   1. 是否已设置远程仓库
    echo   2. 网络连接是否正常
    echo   3. GitHub 凭证是否正确
    pause
    exit /b 1
)

echo.
echo ========================================
echo  部署完成！
echo ========================================
echo.
echo [✓] 代码已推送到 GitHub
echo [✓] GitHub Pages 会在几分钟内自动更新
echo.
echo 提示:
echo   - 网站地址: https://YOUR_USERNAME.github.io/YOUR_REPO/
echo   - 查看状态: GitHub 仓库的 Pages 设置
echo   - 通常 1-3 分钟后网站会自动更新
echo.
pause

