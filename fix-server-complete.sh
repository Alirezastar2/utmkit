#!/bin/bash

# اسکریپت کامل رفع مشکلات سرور
# اجرا: bash fix-server-complete.sh

set -e

echo "🚀 شروع رفع مشکلات سرور..."
echo ""

cd /root/utmkit

# 1. حل مشکل Git merge conflict
echo "📦 حل مشکل Git merge conflict..."
git stash || true
git reset --hard origin/main || git reset --hard origin/master
git pull origin main || git pull origin master

# 2. توقف PM2
echo "🛑 توقف PM2..."
pm2 stop utmkit || true
pm2 delete utmkit || true

# 3. توقف تمام پروسه‌های Node.js
echo "🛑 توقف تمام پروسه‌های Node.js..."
pkill -9 node || true
sleep 2

# 4. بررسی پورت 3000
echo "🔍 بررسی پورت 3000..."
if lsof -i :3000 >/dev/null 2>&1 || netstat -tulpn 2>/dev/null | grep -q :3000; then
    echo "⚠️  پورت 3000 هنوز در حال استفاده است، تلاش برای آزاد کردن..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# 5. نصب وابستگی‌ها
echo "📦 نصب وابستگی‌ها..."
npm install

# 6. Generate Prisma Client
echo "🔧 تولید Prisma Client..."
npx prisma generate

# 7. Build پروژه
echo "🏗️ بیلد پروژه..."
npm run build

# 8. راه‌اندازی PM2
echo "▶️ راه‌اندازی PM2..."
if [ -f ecosystem.config.js ]; then
    pm2 start ecosystem.config.js
else
    pm2 start npm --name "utmkit" -- start
fi

pm2 save

# 9. نمایش وضعیت
echo ""
echo "📊 وضعیت PM2:"
pm2 status

echo ""
echo "📋 آخرین لاگ‌ها:"
pm2 logs utmkit --lines 10 --nostream

echo ""
echo "✅ تمام مراحل با موفقیت انجام شد!"
echo "🌐 بررسی کنید: https://utmkit.ir"

