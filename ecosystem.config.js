// خواندن متغیرهای محیطی از فایل .env
require('dotenv').config({ path: '/root/utmkit/.env' })

module.exports = {
  apps: [
    {
      name: 'utmkit',
      script: 'npm',
      args: 'start',
      cwd: '/root/utmkit',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // تنظیم متغیرهای محیطی مستقیماً
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://utmkit.ir',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL || 'https://utmkit.ir/payment/callback',
      },
    },
  ],
}

