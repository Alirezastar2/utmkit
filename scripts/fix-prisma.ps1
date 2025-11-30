# اسکریپت رفع مشکل EPERM در Prisma
Write-Host "در حال بستن پروسه‌های Node.js..." -ForegroundColor Yellow

# بستن تمام پروسه‌های Next.js و Node.js مرتبط
Get-Process | Where-Object {
    $_.ProcessName -like "*node*" -and 
    $_.Path -notlike "*cursor*" -and
    $_.Path -notlike "*Code*"
} | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "پروسه $($_.ProcessName) (ID: $($_.Id)) بسته شد" -ForegroundColor Green
    } catch {
        Write-Host "نتوانست پروسه $($_.ProcessName) را ببندد" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

Write-Host "`nدر حال پاک کردن فایل‌های موقت Prisma..." -ForegroundColor Yellow

# حذف فایل‌های موقت
$prismaPath = "node_modules\.prisma\client"
if (Test-Path $prismaPath) {
    Get-ChildItem -Path $prismaPath -Filter "*.tmp*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "فایل‌های موقت حذف شدند" -ForegroundColor Green
}

Write-Host "`nدر حال تولید مجدد Prisma Client..." -ForegroundColor Yellow

# تولید مجدد Prisma
try {
    npx prisma generate
    Write-Host "`n✅ Prisma Client با موفقیت تولید شد!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ خطا در تولید Prisma Client" -ForegroundColor Red
    Write-Host "لطفاً PowerShell را با دسترسی Administrator اجرا کنید" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ مشکل برطرف شد! حالا می‌توانید 'npm run build' را اجرا کنید." -ForegroundColor Green

