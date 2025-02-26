module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'backend',
      cwd: './backend/src',  // Keep this as your main.py is here
      script: 'uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000',
      interpreter: 'python3'
    }
  ]
};
