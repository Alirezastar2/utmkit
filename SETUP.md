# راهنمای راه‌اندازی و رفع مشکلات

## مشکلات رایج و راه حل‌ها

### 1. خطای Prisma Client

اگر خطای `@prisma/client did not initialize yet` می‌بینید:

```bash
npm run prisma:generate
```

### 2. خطای NEXTAUTH_SECRET

اگر خطای `[next-auth][error][NO_SECRET]` می‌بینید:

1. مطمئن شوید فایل `.env` در ریشه پروژه وجود دارد
2. محتوای `.env` باید شامل موارد زیر باشد:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="یک-رشته-تصادفی-و-امن-اینجا-قرار-دهید"
NEXTAUTH_URL="http://localhost:3000"
```

برای تولید یک secret امن، می‌توانید از دستور زیر استفاده کنید:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. خطای "database is locked"

این خطا زمانی رخ می‌دهد که:
- Next.js dev server در حال اجرا است
- Prisma Studio باز است
- یا فایل دیتابیس توسط برنامه دیگری استفاده می‌شود

**راه حل:**
1. تمام پروسه‌های Node.js را متوقف کنید (Ctrl+C در ترمینال)
2. اگر Prisma Studio باز است، آن را ببندید
3. سپس migration را اجرا کنید:

```bash
npm run prisma:migrate
```

### 4. مراحل کامل راه‌اندازی (از صفر)

```bash
# 1. نصب وابستگی‌ها
npm install

# 2. ایجاد فایل .env (اگر وجود ندارد)
# محتوای .env:
# DATABASE_URL="file:./dev.db"
# NEXTAUTH_SECRET="یک-رشته-تصادفی"
# NEXTAUTH_URL="http://localhost:3000"

# 3. تولید Prisma Client
npm run prisma:generate

# 4. اجرای migrations (مطمئن شوید Next.js در حال اجرا نیست)
npm run prisma:migrate

# 5. پر کردن دیتابیس با داده‌های نمونه
npm run prisma:seed

# 6. اجرای پروژه
npm run dev
```

### 5. اگر migration قبلاً اجرا شده

اگر می‌خواهید دیتابیس را از اول بسازید:

```bash
# حذف فایل دیتابیس قدیمی
rm dev.db
rm dev.db-journal

# یا در Windows PowerShell:
Remove-Item dev.db
Remove-Item dev.db-journal

# سپس migration را دوباره اجرا کنید
npm run prisma:migrate
npm run prisma:seed
```

### 6. تغییرات Schema

اگر schema را تغییر دادید:

```bash
# 1. تولید Client جدید
npm run prisma:generate

# 2. ایجاد migration جدید
npm run prisma:migrate

# 3. اگر در development هستید و می‌خواهید دیتابیس را reset کنید:
npx prisma migrate reset
```

### 7. مشاهده دیتابیس

برای مشاهده محتوای دیتابیس:

```bash
npm run prisma:studio
```

این دستور یک رابط گرافیکی در `http://localhost:5555` باز می‌کند.

## نکات مهم

- **همیشه قبل از اجرای migration، Next.js dev server را متوقف کنید**
- **فایل `.env` را در `.gitignore` قرار دهید** (قبلاً اضافه شده)
- **در production، از PostgreSQL استفاده کنید** نه SQLite
- **NEXTAUTH_SECRET باید یک رشته تصادفی و امن باشد**

## حساب کاربری تست

پس از اجرای seed:

- **ایمیل:** `test@example.com`
- **رمز عبور:** `123456`

## پشتیبانی

اگر مشکل دیگری دارید، لطفاً خطای کامل را بررسی کنید و مطمئن شوید:
1. تمام وابستگی‌ها نصب شده‌اند
2. فایل `.env` درست تنظیم شده
3. Prisma Client تولید شده
4. Migration اجرا شده
5. Next.js dev server متوقف است قبل از اجرای migration





