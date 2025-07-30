import { Router,Request, Response } from "express";
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../utils/jwt";
import {check, validationResult} from 'express-validator';
import { createUser, findUserByEmail, findUserByUsername } from "..//utils/search";
import * as z from 'zod'
import { validataMiddleware } from "../middleware/validata";
import { ApiResponse } from "../types/normal";

const router = Router()

const LoginBodyScheme = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty()
})
type LoginBody = z.infer<typeof LoginBodyScheme>
router.post('/login', validataMiddleware(LoginBodyScheme), async (req:Request<{}, {}, LoginBody>, res: Response<ApiResponse>)=>{
    const {username, password} = {...req.body}
    const user = await findUserByUsername(username)
    if(!user){
        return res.send({ message: 'dot\'t have username' })
    }
    // 验证密码
    const re = await bcrypt.compare(password, user.password_hash)
    
    if(re){
        const token = generateToken({
            username,
            id: user.id
        })
        // httpOnly 阻止前端js读取cookie
        // secure 只允许https发送请求时携带cookie
        res.cookie('token', token, {
            httpOnly: process.env.NODE_ENV === 'development' ? false : true, 
            secure:process.env.NODE_ENV === 'development' ? false : true,
            maxAge: 9000000
        })  
        res.status(200).send({})
    }else{
        res.status(401).send({ message: 'password err' })
    }
    
})

router.get('/vertify', (req, res: Response<ApiResponse<{pass: boolean, message?: string}>>)=>{
    const token = req.cookies.token as string
    console.log(token)
    if(!token){
        res.status(200).send({
            pass: false,
            message: 'don\'t hava token'
        })
        return
    }
    if(verifyToken(token)){
        res.status(200).send({
            pass: true
        })
    }else{
        res.status(200).send({
            pass: false,
        })
    }
})


type RegisterBody = {
    username: string,
    password: string,
    email: string
}
//! 这个接口使用express-validator, 它比zod更轻量，默认中间件使用，错误会集中到响应中
// 用户注册接口
router.post(
  '/register',
  [
    // 用户名验证：必填，长度 3-20 个字符
    check('username')
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 1, max: 50 })
      .withMessage('用户名长度必须在 3-20 个字符之间'),
    
    // 密码验证：必填，长度至少 6 个字符
    check('password')
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码长度至少需要 6 个字符'),
    
    // 邮箱验证：必填，格式合法
    check('email')
      .notEmpty()
      .withMessage('邮箱不能为空')
      .isEmail()
      .withMessage('请输入合法的邮箱地址')
  ],
  async (req: Request<{}, {}, RegisterBody>, res: Response<ApiResponse>) => {
    // 检查验证结果
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'valid error', details: errors.array() });
    }

    const { username, password, email } = req.body;
    // 1. 检查用户名是否已存在
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return res.status(400).json({message: 'username exist'});
    }
    // 2. 检查邮箱是否已存在
    const existingEmail = await findUserByEmail(email)
    if (existingEmail) {
      return res.status(400).json({ message: 'email exist' });
    }
    // 3. 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // 4. 创建新用户
    await createUser({
        username,
        password_hash: hashedPassword,
        email
    })
    // 5. 返回成功响应
    res.status(201).json({});
  }
);


export default router