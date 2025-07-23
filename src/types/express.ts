import express from 'express'
export interface VertifiedUserInfo{
    userid: number
    username: string
}
declare module "express" {
    // Inject additional properties on express.Request
    interface Request {
        // resourceType?: string,
        userInfo?: VertifiedUserInfo; // 验证token后将得到的用户信息挂载在req上
    }
}