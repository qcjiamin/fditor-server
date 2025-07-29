import { NextFunction, Request, Response } from "express";
import { secret } from '../utils/jwt'
import jwt from "jsonwebtoken";
import type { TokenUserInfo } from "../types/normal";
export const authMiddleware = (req: Request, res:Response, next:NextFunction) => {
    // 从请求头中获取 Token（通常是 Bearer Token 格式）
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer token
    const token = req.cookies.token as string
    if(!token){
        res.status(401).send({
            message: 'don\'t hava token'
        })
        return
    }
    try {
        // console.log(res)
        const decordToken = jwt.verify(token, secret) as jwt.JwtPayload
        //! 之前一直报错；通过设置 tsconfig.typeRoots，解决在tsc编译时报错
        req.userInfo = decordToken as TokenUserInfo
        next()
    } catch (error) {
        res.status(401).send({
            message: 'token vertify failed'
        })
    }
  }