// watch: true 与 cluster 一起用时会有问题（不建议）
// PM2 不推荐在 cluster 模式下使用 watch: true，这会导致重启/冲突/失效等问题。

// 建议：开发用 fork + watch，生产用 cluster + instances，不要混合

// 如果你需要 instances: 4，建议关闭 watch，改用手动或热更新工具（如 nodemon）调试。

module.exports = {
  apps: [
    {
      name: "fditor-server",
      script: "./dist/server.js",
      interpreter: "node",
      interpreter_args: "--env-file .env",
      env_development: {
        NODE_ENV: "development"
      },
      exec_mode: "cluster", // ✅ 多进程必须有
      instances: 4,
      // watch: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};