// import express from 'express'
import type { TokenUserInfo } from './normal.js'

declare module "express" {
    // Inject additional properties on express.Request
    interface Request {
        // resourceType?: string,
        userInfo?: TokenUserInfo; // 验证token后将得到的用户信息挂载在req上
    }
}

//! 注意：如果在其他文件中使用express.Request，需要先引入express模块，否则会报错
export {}