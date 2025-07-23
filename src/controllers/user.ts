import { Router,Request, Response } from "express";
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../utils/jwt";
import {check, validationResult} from 'express-validator';
import { createUser, findUserByEmail, findUserByUsername } from "..//utils/search";

const router = Router()

router.post('/login', async (req, res, next)=>{
    const {username, password} = {...req.body}
    const user = await findUserByUsername(username)
    if(!user){
        res.send({
            success: false,
            message: 'dot\'t have username'
        })
        return
    }
    // 验证密码
    const re = await bcrypt.compare(password, user.password_hash)
    
    if(re){
        const token = generateToken({
            username,
        })
        // httpOnly 阻止前端js读取cookie
        // secure 只允许https发送请求时携带cookie
        res.cookie('token', token, {
            httpOnly: process.env.NODE_ENV === 'development' ? false : true, 
            secure:process.env.NODE_ENV === 'development' ? false : true,
        })  
        res.send({
            success: true,
            message: ''
        })
    }else{
        res.send({
            success: false,
            message: 'password err'
        })
    }
    
})

router.get('/vertify', (req, res, next)=>{
    const token = req.cookies.token as string
    console.log(token)
    if(!token){
        res.send({
            success: false,
            message: 'don\'t hava token'
        })
        return
    }
    res.send(verifyToken(token))
})
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
  async (req: Request, res: Response) => {
    // 检查验证结果
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;
        // 1. 检查用户名是否已存在
        const existingUser = await findUserByUsername(username)

        if (existingUser) {
          return res.status(400).json({ error: '用户名已被注册' });
        }

        // 2. 检查邮箱是否已存在
        const existingEmail = await findUserByEmail(email)
        if (existingEmail) {
          return res.status(400).json({ error: '邮箱已被注册' });
        }

        // 3. 密码加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. 创建新用户
        await createUser({
            username,
            password_hash: hashedPassword,
            password_salt: salt,
            email
        }).catch((error)=>{
            console.log(error)
            return res.status(500).json({ error: 'sql error' });
        })

        // 5. 返回成功响应
        res.status(201).json({
            success: true,
            message: '注册成功',
        });
  }
);


export default router