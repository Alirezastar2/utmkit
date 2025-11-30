# راهنمای Deployment - یوتیم کیت

## 🔧 مشکل Sitemap 404

اگر sitemap.xml با خطای 404 مواجه می‌شوید، مراحل زیر را انجام دهید:

### 1. بررسی Environment Variables

مطمئن شوید که در `.env` یا environment variables سرور، این متغیر تنظیم شده است:

```env
NEXT_PUBLIC_SITE_URL=https://utmkit.ir
```

### 2. Rebuild پروژه

بعد از تغییرات، حتماً پروژه را rebuild کنید:

```bash
# روی سرور
cd /root/utmkit
npm run build
```

### 3. Restart سرور

بعد از rebuild، سرور را restart کنید:

```bash
# اگر از PM2 استفاده می‌کنید
pm2 restart utmkit

# یا اگر از systemd استفاده می‌کنید
sudo systemctl restart utmkit
```

### 4. تست Sitemap

بعد از restart، sitemap باید در این آدرس در دسترس باشد:
```
https://utmkit.ir/sitemap.xml
```

---

## 🚀 مراحل کامل Deployment

### روش 1: استفاده از deploy.sh (پیشنهادی)

```bash
# روی سرور
cd /root/utmkit
git pull origin main
bash deploy.sh
```

این اسکریپت به صورت خودکار:
- وابستگی‌ها را نصب می‌کند
- Prisma Client را generate می‌کند
- Migration را اجرا می‌کند
- پروژه را build می‌کند
- PM2 را restart می‌کند

### روش 2: Deployment دستی

```bash
# 1. Pull آخرین تغییرات
cd /root/utmkit
git pull origin main

# 2. نصب وابستگی‌ها
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. اجرای Migration (اگر نیاز باشد)
npx prisma migrate deploy

# 5. Build پروژه
npm run build

# 6. Restart PM2
pm2 restart utmkit
# یا
pm2 stop utmkit
pm2 delete utmkit
pm2 start npm --name "utmkit" -- start
pm2 save
```

---

## 🔄 تنظیمات GitHub Actions (اختیاری)

برای deployment خودکار بعد از push به GitHub:

### ایجاد `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/utmkit
            git pull origin main
            bash deploy.sh
```

### تنظیم Secrets در GitHub:

1. به Repository → Settings → Secrets and variables → Actions بروید
2. این Secrets را اضافه کنید:
   - `SERVER_HOST`: آدرس IP سرور (مثلاً `185.213.165.225`)
   - `SERVER_USER`: نام کاربری (مثلاً `root`)
   - `SSH_PRIVATE_KEY`: کلید SSH خصوصی

---

## ✅ چک‌لیست بعد از Deployment

- [ ] بررسی کنید که سایت در دسترس است
- [ ] بررسی کنید که `/sitemap.xml` کار می‌کند
- [ ] بررسی کنید که `/robots.txt` کار می‌کند
- [ ] بررسی کنید که Environment Variables درست تنظیم شده‌اند
- [ ] بررسی کنید که Database connection کار می‌کند
- [ ] بررسی کنید که Authentication کار می‌کند
- [ ] بررسی کنید که API endpoints کار می‌کنند

---

## 🐛 عیب‌یابی

### مشکل: Sitemap 404 می‌دهد

**راه‌حل:**
1. مطمئن شوید که `NEXT_PUBLIC_SITE_URL` در `.env` تنظیم شده است
2. پروژه را rebuild کنید: `npm run build`
3. سرور را restart کنید

### مشکل: تغییرات اعمال نمی‌شوند

**راه‌حل:**
1. مطمئن شوید که `git pull` انجام شده است
2. Cache را پاک کنید: `rm -rf .next`
3. دوباره build کنید: `npm run build`
4. Restart کنید

### مشکل: خطای Prisma

**راه‌حل:**
```bash
npx prisma generate
npx prisma migrate deploy
```

### مشکل: خطای Memory

**راه‌حل:**
```bash
# افزایش memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## 📝 نکات مهم

1. **همیشه قبل از deployment**: تغییرات را در local تست کنید
2. **Environment Variables**: هرگز فایل `.env` را commit نکنید
3. **Database Backup**: قبل از migration، backup بگیرید
4. **Monitoring**: از PM2 monitoring استفاده کنید: `pm2 monit`

---

**آخرین به‌روزرسانی**: ۱۴۰۴/۰۹/۰۴

