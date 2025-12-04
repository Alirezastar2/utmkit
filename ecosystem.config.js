module.exports = {
  apps: [
    {
      name: 'utmkit',
      // استفاده از dotenv-cli برای خواندن .env
      script: 'npx',
      args: 'dotenv -e .env -- npm start',
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
    },
  ],
}

