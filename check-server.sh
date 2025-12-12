#!/bin/bash

# اسکریپت تشخیص مشکل سرور
# اجرا: bash check-server.sh

echo "🔍 بررسی وضعیت سرور..."
echo ""

# 1. بررسی وضعیت PM2
echo "📊 وضعیت PM2:"
pm2 status
echo ""

# 2. بررسی لاگ‌های PM2
echo "📋 آخرین خطاهای PM2 (20 خط آخر):"
pm2 logs utmkit --lines 20 --err
echo ""

# 3. بررسی لاگ‌های خروجی
echo "📋 آخرین خروجی PM2 (20 خط آخر):"
pm2 logs utmkit --lines 20 --out
echo ""

# 4. بررسی وجود فایل .env
echo "🔐 بررسی فایل .env:"
if [ -f /root/utmkit/.env ]; then
    echo "✅ فایل .env وجود دارد"
    echo "بررسی NEXTAUTH_SECRET:"
    if grep -q "NEXTAUTH_SECRET" /root/utmkit/.env; then
        echo "✅ NEXTAUTH_SECRET تنظیم شده است"
    else
        echo "❌ NEXTAUTH_SECRET تنظیم نشده است!"
    fi
else
    echo "❌ فایل .env وجود ندارد!"
fi
echo ""

# 5. بررسی پورت 3000
echo "🌐 بررسی پورت 3000:"
if netstat -tuln | grep -q ":3000"; then
    echo "✅ پورت 3000 در حال استفاده است"
    netstat -tuln | grep ":3000"
else
    echo "❌ پورت 3000 در حال استفاده نیست!"
fi
echo ""

# 6. بررسی استفاده از حافظه
echo "💾 استفاده از حافظه:"
free -h
echo ""

# 7. بررسی فضای دیسک
echo "💿 فضای دیسک:"
df -h /root
echo ""

# 8. بررسی پروسه‌های Node.js
echo "🔧 پروسه‌های Node.js:"
ps aux | grep node | grep -v grep
echo ""

echo "✅ بررسی کامل شد!"
