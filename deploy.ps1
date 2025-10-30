Param(
  [ValidateSet('local','server')] [string]$Mode = 'local',
  [string]$RemoteHost = '120.55.74.14',
  [string]$RemoteUser = 'root',
  [string]$RemotePath = '/root/STT-platform',
  [string]$RemotePort = '3000',
  [string]$AppName = 'STT-Learning-Platform'
)

Write-Host "🚀 deploy.ps1 starting (mode=$Mode)"

if ($Mode -eq 'server') {
  Write-Host "📂 Server mode at $RemotePath"
  $cmd = @(
    "set -e",
    "cd $RemotePath",
    "npm install",
    "mkdir -p uploads/tmp && chmod 755 uploads/tmp",
    "pm2 stop $AppName 2>/dev/null || true; pm2 start ecosystem.config.js --env production 2>/dev/null || pm2 restart $AppName; pm2 save",
    "pm2 status"
  ) -join '; '
  bash -lc $cmd
  Write-Host ("✅ Done. App: {0} at http://localhost:{1}" -f $AppName, $RemotePort)
  exit 0
}

if (!(Test-Path 'config.json')) {
  Write-Error "Missing config.json. Copy config.example.json and fill API keys."; exit 1
}

Write-Host ("🌐 Target: {0}@{1}:{2}" -f $RemoteUser, $RemoteHost, $RemotePath)

# Prefer rsync if available; otherwise use tar+scp
$hasRsync = $null -ne (Get-Command rsync -ErrorAction SilentlyContinue)
if ($hasRsync) {
  Write-Host "📤 Uploading with rsync..."
  & rsync -avz --delete --progress `
    --exclude 'node_modules' `
    --exclude '.git' `
    --exclude 'logs' `
    --exclude '*.log' `
    --exclude '.env' `
    --exclude '.vscode' `
    ./ ("{0}@{1}:{2}/" -f $RemoteUser, $RemoteHost, $RemotePath)
} else {
  Write-Host "📦 Creating archive and uploading with scp..."
  $tempTar = [System.IO.Path]::GetTempFileName()
  $tarPath = "$tempTar.tgz"
  Remove-Item $tempTar -Force
  & tar czf $tarPath --exclude='node_modules' --exclude='.git' --exclude='logs' --exclude='*.log' --exclude='.env' --exclude='.vscode' .
  & scp $tarPath ("{0}@{1}:/tmp/deploy.tar.gz" -f $RemoteUser, $RemoteHost)
  & ssh ("{0}@{1}" -f $RemoteUser, $RemoteHost) ("mkdir -p '{0}' && tar xzf /tmp/deploy.tar.gz -C '{0}' && rm /tmp/deploy.tar.gz" -f $RemotePath)
  Remove-Item $tarPath -Force
}

Write-Host "🔧 Remote install and restart..."
ssh ("{0}@{1}" -f $RemoteUser, $RemoteHost) @"
set -e
cd "$RemotePath"
npm install
mkdir -p uploads/tmp && chmod 755 uploads/tmp
pm2 stop $AppName 2>/dev/null || true; pm2 start ecosystem.config.js --env production 2>/dev/null || pm2 restart $AppName; pm2 save
pm2 status
"@

Write-Host ("✅ Deployed. Visit: http://{0}:{1}" -f $RemoteHost, $RemotePort)


