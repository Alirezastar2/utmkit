# راهنمای رفع مشکل Database Locked

## مشکل
خطای `database is locked` یا `Operations timed out` نشان می‌دهد که:
- Next.js dev server در حال استفاده از دیتابیس است
- یا دیتابیس در مسیر اشتباه قرار دارد

## راه حل کامل

### مرحله 1: متوقف کردن تمام پروسه‌های Node.js

**در PowerShell:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

**یا به صورت دستی:**
- در ترمینالی که `npm run dev` را اجرا کرده‌اید، `Ctrl+C` بزنید
- تمام پنجره‌های ترمینال Node.js را ببندید

### مرحله 2: پاک کردن دیتابیس قدیمی

```powershell
cd E:\Project\Alireza
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item dev.db-journal -ErrorAction SilentlyContinue
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue
Remove-Item prisma\dev.db-journal -ErrorAction SilentlyContinue
```

### مرحله 3: اجرای Migration

```powershell
npm run prisma:migrate
```

اگر خطا داد، از این دستور استفاده کنید:
```powershell
npx prisma migrate dev --name init
```

### مرحله 4: اجرای Seed

```powershell
npm run prisma:seed
```

### مرحله 5: راه‌اندازی مجدد پروژه

```powershell
npm run dev
```

## اگر مشکل ادامه داشت

### گزینه 1: استفاده از Prisma Studio برای بررسی

```powershell
npm run prisma:studio
```

این دستور یک رابط گرافیکی باز می‌کند که می‌توانید دیتابیس را مشاهده کنید.

### گزینه 2: Reset کامل دیتابیس

```powershell
npx prisma migrate reset
```

این دستور:
- تمام داده‌ها را پاک می‌کند
- Migration ها را دوباره اجرا می‌کند
- Seed را اجرا می‌کند

⚠️ **هشدار:** این دستور تمام داده‌ها را پاک می‌کند!

### گزینه 3: بررسی مسیر DATABASE_URL

مطمئن شوید که در فایل `.env` مسیر درست است:

```env
DATABASE_URL="file:./dev.db"
```

نه:
```env
DATABASE_URL="file:./prisma/dev.db"  # ❌ اشتباه
```

## نکات مهم

1. **همیشه قبل از migration، Next.js را متوقف کنید**
2. **اگر دیتابیس قفل شده، تمام پروسه‌های Node.js را ببندید**
3. **مسیر DATABASE_URL باید به `./dev.db` در ریشه پروژه اشاره کند**
4. **در Windows، گاهی اوقات باید PowerShell را به عنوان Administrator اجرا کنید**





