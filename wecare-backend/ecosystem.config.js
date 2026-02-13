module.exports = {
    apps: [{
        name: 'wecare-backend',
        script: './dist/index.js',

        // Cluster mode for better performance
        instances: 2,
        exec_mode: 'cluster',

        // Environment variables
        env_production: {
            NODE_ENV: 'production',
            PORT: 3001
        },

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Auto-restart configuration
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '500M',

        // Watch for file changes (disable in production)
        watch: false,

        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,

        // Source map support
        source_map_support: true,

        // Instance variables
        instance_var: 'INSTANCE_ID',
    }]
};
