import { NextFunction, Request, Response } from "express";
import { z, ZodObject, ZodSafeParseResult } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';
/** 参数验证中间件 */
export const validataMiddleware = (schema: ZodObject, target: ValidationTarget='body')=>{
    return async (req: Request, res:Response, next:NextFunction) => {
        try{
            const data = target === 'body' ? req.body : 
                  target === 'params' ? req.params : req.query;
            const validatedResult: ZodSafeParseResult<any>= await schema.safeParseAsync(data)
            if(!validatedResult.success){
                return res.status(400).json({
                    error: 'params valid error', 
                    details: validatedResult.error.format() 
                })
            }
            // 将验证后的数据赋值回请求对象
            if (target === 'body') req.body = validatedResult.data;
            else if (target === 'params') req.params = validatedResult.data;
            else req.query = validatedResult.data;
            next()
        } catch(error){
            res.status(400).json()
        }
    }
}