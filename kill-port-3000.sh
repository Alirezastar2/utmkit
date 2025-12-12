#!/bin/bash

# اسکریپت قوی برای آزاد کردن پورت 3000
# اجرا: bash kill-port-3000.sh

echo "🛑 توقف کامل PM2 و آزاد کردن پورت 3000..."
echo ""

# 1. غیرفعال کردن auto-restart در PM2
echo "⏸️  غیرفعال کردن auto-restart PM2..."
pm2 stop all || true
pm2 kill || true

# 2. پیدا کردن و توقف تمام پروسه‌های Node.js
echo "🔍 پیدا کردن تمام پروسه‌های Node.js..."
NODE_PIDS=$(ps aux | grep node | grep -v grep | awk '{print $2}')
if [ ! -z "$NODE_PIDS" ]; then
    echo "🛑 توقف پروسه‌های Node.js: $NODE_PIDS"
    echo "$NODE_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 3. پیدا کردن پروسه‌های استفاده‌کننده از پورت 3000 با روش‌های مختلف
echo "🔍 پیدا کردن پروسه‌های استفاده‌کننده از پورت 3000..."

# روش 1: lsof
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti :3000 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "✅ پیدا شد با lsof: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
fi

# روش 2: fuser
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
fi

# روش 3: netstat
if command -v netstat &> /dev/null; then
    NETSTAT_PIDS=$(netstat -tulpn 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$' | sort -u)
    if [ ! -z "$NETSTAT_PIDS" ]; then
        echo "✅ پیدا شد با netstat: $NETSTAT_PIDS"
        echo "$NETSTAT_PIDS" | xargs kill -9 2>/dev/null || true
    fi
fi

# روش 4: ss
if command -v ss &> /dev/null; then
    SS_PIDS=$(ss -tulpn 2>/dev/null | grep :3000 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | grep -E '^[0-9]+$' | sort -u)
    if [ ! -z "$SS_PIDS" ]; then
        echo "✅ پیدا شد با ss: $SS_PIDS"
        echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
    fi
fi

# 4. صبر کردن برای آزاد شدن پورت
echo "⏳ صبر برای آزاد شدن پورت..."
sleep 3

# 5. بررسی مجدد
echo "🔍 بررسی مجدد پورت 3000..."
if lsof -i :3000 >/dev/null 2>&1 || (netstat -tulpn 2>/dev/null | grep -q :3000) || (ss -tulpn 2>/dev/null | grep -q :3000); then
    echo "⚠️  پورت 3000 هنوز در حال استفاده است!"
    echo "لطفاً به صورت دستی بررسی کنید:"
    echo "  lsof -i :3000"
    echo "  netstat -tulpn | grep 3000"
    echo "  ps aux | grep node"
    exit 1
else
    echo "✅ پورت 3000 آزاد شد!"
fi

echo ""
echo "✅ پورت 3000 آزاد شد. حالا می‌توانید PM2 را راه‌اندازی کنید:"
echo "  cd /root/utmkit"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"

