#!/bin/bash

# 统一部署脚本（Linux/Mac）
# 用法示例：
#  1) 本地→服务器完整部署：
#     ./deploy.sh --mode local --host 120.55.74.14 --user root --path /root/STT-platform --port 3000 --app STT-Learning-Platform
#  2) 服务器内自更新：
#     ./deploy.sh --mode server --path /root/STT-platform --app STT-Learning-Platform

set -e

MODE="local"
HOST="120.55.74.14"
USER_NAME="root"
REMOTE_PATH="/root/STT-platform"
PORT="3000"
APP_NAME="STT-Learning-Platform"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"; shift 2;;
    --host)
      HOST="$2"; shift 2;;
    --user)
      USER_NAME="$2"; shift 2;;
    --path)
      REMOTE_PATH="$2"; shift 2;;
    --port)
      PORT="$2"; shift 2;;
    --app)
      APP_NAME="$2"; shift 2;;
    -h|--help)
      echo "Usage: $0 --mode [local|server] [--host IP] [--user USER] --path REMOTE_PATH --port PORT --app APP_NAME"; exit 0;;
    *)
      echo "Unknown arg: $1"; exit 1;;
  esac
done

echo "🚀 deploy.sh starting (mode=$MODE)"

ensure_upload_dir_cmd='mkdir -p uploads/tmp && chmod 755 uploads/tmp'
start_pm2_cmd='pm2 stop '"$APP_NAME"' 2>/dev/null || true; pm2 start ecosystem.config.js --env production 2>/dev/null || pm2 restart '"$APP_NAME"'; pm2 save'

install_cmd='npm install'

if [[ "$MODE" == "server" ]]; then
  echo "📂 Working in server mode at $REMOTE_PATH"
  cd "$REMOTE_PATH"
  echo "📥 Installing deps..."; eval "$install_cmd"
  echo "📁 Ensuring upload dir..."; eval "$ensure_upload_dir_cmd"
  echo "🔄 Restarting with pm2..."; bash -lc "$start_pm2_cmd"
  echo "✅ Done. App: $APP_NAME at http://localhost:$PORT"
  exit 0
fi

# local mode
echo "🌐 Target: $USER_NAME@$HOST:$REMOTE_PATH"

if [ ! -f "config.json" ]; then
  echo "❌ Missing config.json. Copy config.example.json and fill API keys."; exit 1
fi

echo "📤 Uploading files..."
if command -v rsync >/dev/null 2>&1; then
  rsync -avz --delete --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'logs' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.vscode' \
    ./ "$USER_NAME@$HOST:$REMOTE_PATH/"
else
  TEMP_TAR=$(mktemp)
  tar czf "$TEMP_TAR" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.vscode' \
    .
  scp "$TEMP_TAR" "$USER_NAME@$HOST:/tmp/deploy.tar.gz"
  ssh "$USER_NAME@$HOST" "mkdir -p '$REMOTE_PATH' && tar xzf /tmp/deploy.tar.gz -C '$REMOTE_PATH' && rm /tmp/deploy.tar.gz"
  rm "$TEMP_TAR"
fi

echo "🔧 Remote install and restart..."
ssh "$USER_NAME@$HOST" << EOF
set -e
cd "$REMOTE_PATH"
$install_cmd
$ensure_upload_dir_cmd
bash -lc "$start_pm2_cmd"
pm2 status
EOF

echo "✅ Deployed. Visit: http://$HOST:$PORT"


