module.exports = {
    apps: [
        {
            name: 'petgo-admin',
            script: '.next/standalone/server.js',
            cwd: '/var/www/admin.petgo.asia/pet_transport_admin',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                HOSTNAME: '0.0.0.0',
            },
            error_file: '/var/www/admin.petgo.asia/logs/pm2-error.log',
            out_file: '/var/www/admin.petgo.asia/logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
        },
    ],
};
