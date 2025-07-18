import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { execQuery } from "../utils/db";
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/jwt";
 const router = Router()

interface User extends RowDataPacket{
    accountNumber: string,
    password: string,
    email?: string,
    id: number,
    gender: 0|1,
    deleted: boolean
}

router.post('/login', async (req, res, next)=>{
    const {account, password} = {...req.body}
    const sqlStr = 'select * from user where accountNumber=?'
    const result = await execQuery<User>(sqlStr, [account])
    if(result.length !== 1) {
        res.send({
            success: false,
            message: 'over 1 users has the same account'
        })
        return
    }
    const user = result[0]
    // 验证密码
    const re = await bcrypt.compare(password, user.password)
    if(re){
        const token = generateToken({
            account,
            password
        })
        // httpOnly 阻止前端js读取cookie
        // secure 只允许https发送请求时携带cookie
        res.cookie('token', token, {httpOnly: true, secure: true})  
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

export default router