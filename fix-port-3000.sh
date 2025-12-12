#!/bin/bash

# اسکریپت رفع مشکل Port 3000
# اجرا: bash fix-port-3000.sh

echo "🔍 بررسی پروسه‌های استفاده‌کننده از پورت 3000..."

# 1. پیدا کردن پروسه‌های استفاده‌کننده از پورت 3000
echo "📊 پروسه‌های استفاده‌کننده از پورت 3000:"
lsof -i :3000 || netstat -tulpn | grep :3000 || ss -tulpn | grep :3000

echo ""
echo "🛑 توقف PM2..."
pm2 stop utmkit || true
pm2 delete utmkit || true

echo ""
echo "🔍 پیدا کردن و توقف پروسه‌های Node.js روی پورت 3000..."

# 2. پیدا کردن PID پروسه‌های استفاده‌کننده از پورت 3000
PIDS=$(lsof -ti :3000 2>/dev/null || fuser 3000/tcp 2>/dev/null | awk '{print $1}' || echo "")

if [ -z "$PIDS" ]; then
    # روش جایگزین با netstat
    PIDS=$(netstat -tulpn 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | grep -v "^$" || echo "")
fi

if [ -z "$PIDS" ]; then
    # روش جایگزین با ss
    PIDS=$(ss -tulpn 2>/dev/null | grep :3000 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | grep -v "^$" || echo "")
fi

if [ ! -z "$PIDS" ]; then
    echo "✅ پیدا شد: $PIDS"
    for PID in $PIDS; do
        if [ ! -z "$PID" ] && [ "$PID" != "PID" ]; then
            echo "🛑 توقف پروسه $PID..."
            kill -9 $PID 2>/dev/null || true
        fi
    done
    sleep 2
else
    echo "⚠️  پروسه‌ای پیدا نشد (ممکن است قبلاً متوقف شده باشد)"
fi

# 3. بررسی مجدد
echo ""
echo "🔍 بررسی مجدد پورت 3000..."
if lsof -i :3000 >/dev/null 2>&1 || netstat -tulpn 2>/dev/null | grep -q :3000 || ss -tulpn 2>/dev/null | grep -q :3000; then
    echo "❌ هنوز پورت 3000 در حال استفاده است!"
    echo "لطفاً به صورت دستی بررسی کنید:"
    echo "  lsof -i :3000"
    echo "  یا"
    echo "  netstat -tulpn | grep 3000"
else
    echo "✅ پورت 3000 آزاد شد!"
fi

echo ""
echo "🔄 راه‌اندازی مجدد PM2..."
cd /root/utmkit

# 4. راه‌اندازی مجدد با PM2
if [ -f ecosystem.config.js ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "utmkit" -- start
fi

pm2 save

echo ""
echo "📊 وضعیت PM2:"
pm2 status

echo ""
echo "✅ انجام شد! بررسی لاگ‌ها:"
echo "  pm2 logs utmkit --lines 20"

