@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 更新项目到 GitHub
echo ========================================
echo.

cd /d %~dp0

echo 📂 当前目录: %CD%
echo.

echo 📝 检查 Git 状态...
git status

echo.
echo ========================================
echo 📦 添加所有文件...
echo ========================================
git add .

echo.
echo ========================================
echo 💾 提交更改...
echo ========================================
git commit -m "Update: %date% %time%"

echo.
echo ========================================
echo 🚀 推送到 GitHub...
echo ========================================
git push origin main

echo.
echo ========================================
echo ✅ 更新完成！
echo ========================================
echo.
echo 🌐 网站地址: https://peixuan-ding.github.io/student-login-system/
echo ⏱️  更新将在 1-2 分钟后生效
echo.
pause

