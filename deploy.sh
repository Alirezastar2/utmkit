#!/bin/bash

# اسکریپت Deployment برای سرور
# اجرا: bash deploy.sh

set -e  # در صورت خطا متوقف شود

echo "🚀 شروع Deployment..."

cd /root/utmkit

# 0. مدیریت تغییرات محلی قبل از pull
echo "🔄 مدیریت تغییرات محلی..."
git stash || true
git fetch origin
git reset --hard origin/main || git reset --hard origin/master

# 1. ایجاد فایل .env (اگر وجود ندارد)
if [ ! -f .env ]; then
    echo "📝 ایجاد فایل .env..."
    cat > .env << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="https://utmkit.ir"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Payment Gateway
NOVINO_MERCHANT_ID="73D08668-BE7A-4B26-854C-14968226A2C9"
PAYMENT_CALLBACK_URL="https://utmkit.ir/payment/callback"

# Environment
NODE_ENV="production"
EOF
    echo "✅ فایل .env ایجاد شد"
else
    echo "✅ فایل .env از قبل وجود دارد"
fi

# 2. نصب وابستگی‌ها
echo "📦 نصب وابستگی‌ها..."
npm install

# 3. تولید Prisma Client
echo "🔧 تولید Prisma Client..."
npx prisma generate

# 4. اجرای Migration
echo "🗄️ اجرای Migration..."
npx prisma migrate deploy || npx prisma migrate dev --name init

# 5. بیلد پروژه
echo "🏗️ بیلد پروژه..."
npm run build

# 6. توقف PM2 قبلی (اگر در حال اجرا است)
echo "🛑 توقف PM2 قبلی..."
pm2 stop utmkit || true
pm2 delete utmkit || true

# 7. اجرای پروژه با PM2
echo "▶️ اجرای پروژه با PM2..."
pm2 stop utmkit || true
pm2 delete utmkit || true

# استفاده از ecosystem.config.js یا راه‌اندازی با dotenv-cli
if [ -f ecosystem.config.js ]; then
    echo "📋 استفاده از ecosystem.config.js..."
    pm2 start ecosystem.config.js
else
    echo "📋 استفاده از dotenv-cli..."
    # نصب dotenv-cli اگر وجود ندارد
    npm install -g dotenv-cli 2>/dev/null || npm install dotenv-cli --save-dev
    pm2 start "dotenv -e .env -- npm start" --name "utmkit"
fi

pm2 save

# 8. نمایش وضعیت
echo "📊 وضعیت PM2:"
pm2 status

echo "✅ Deployment با موفقیت انجام شد!"
echo "🌐 پروژه در حال اجرا است در: http://185.213.165.225:3000"

