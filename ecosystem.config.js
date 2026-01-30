/**
 * PM2 Process Manager Configuration
 * For production deployment and process management
 */

module.exports = {
  apps: [
    {
      name: 'wecare-backend',
      script: './wecare-backend/dist/index.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto restart
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      max_memory_restart: '500M',
      
      // Restart on file change (development only)
      watch_options: {
        followSymlinks: false,
      },

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Cron restart (daily at 3 AM)
      cron_restart: '0 3 * * *',

      // Source map support
      source_map_support: true,

      // Instance variables
      instance_var: 'INSTANCE_ID',
    },

    {
      name: 'wecare-frontend',
      script: 'serve',
      args: '-s dist -l 5173',
      cwd: './wecare-frontend',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'production',
      },

      // Logging
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/ems-wecare.git',
      path: '/var/www/wecare',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/ems-wecare.git',
      path: '/var/www/wecare-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js',
    },
  },
};
