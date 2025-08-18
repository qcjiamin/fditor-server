// src/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // 声明 PORT 变量，类型为 string 或 undefined
      PORT?: number;
      // 可以同时声明其他环境变量
    //   NODE_ENV?: 'development' | 'production' | 'staging';
    }
  }
}

// 确保此文件被视为模块
export {};