#!/bin/bash

# اسکریپت Deployment برای سرور
# اجرا: bash deploy.sh

set -e  # در صورت خطا متوقف شود

echo "🚀 شروع Deployment..."

cd /root/utmkit

# 1. ایجاد فایل .env (اگر وجود ندارد)
if [ ! -f .env ]; then
    echo "📝 ایجاد فایل .env..."
    cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://185.213.165.225:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

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
pm2 start npm --name "utmkit" -- start
pm2 save

# 8. نمایش وضعیت
echo "📊 وضعیت PM2:"
pm2 status

echo "✅ Deployment با موفقیت انجام شد!"
echo "🌐 پروژه در حال اجرا است در: http://185.213.165.225:3000"

