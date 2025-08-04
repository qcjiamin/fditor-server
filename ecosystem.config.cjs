// watch: true 与 cluster 一起用时会有问题（不建议）
// PM2 不推荐在 cluster 模式下使用 watch: true，这会导致重启/冲突/失效等问题。

// 建议：开发用 fork + watch，生产用 cluster + instances，不要混合

// 如果你需要 instances: 4，建议关闭 watch，改用手动或热更新工具（如 nodemon）调试。

// --experimental-specifier-resolution=node es6要求必须有后缀，这个命令行强制让模块解析规则使用commonjs的，可以不加后缀

module.exports = {
  apps: [
    {
      name: "fditor-server",
      script: "./dist/server.js",
      interpreter: "node",
      interpreter_args: "--env-file .env --experimental-specifier-resolution=node",
      env_development: {
        NODE_ENV: "development"
      },
      exec_mode: "cluster", // ✅ 多进程必须有
      instances: "max",
      // watch: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};