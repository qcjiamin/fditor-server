//----扩展模块需要显式导入----
import './types/express.js'
//--------------------------
import express from "express"
import cors from 'cors'
import userController from './controllers/user.js'
import projectController from './controllers/project.js'
import uploadController from './controllers/upload.js'
import lockController from './controllers/lock.js'
import healthController from './controllers/health.js'
import morgan from "morgan"
import fs from 'fs'
import path  from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PassThrough } from "stream"
import cookieParser from 'cookie-parser'
import { otherErrors } from "./errorHandler/otherErrors.js"

// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);

const app = express()
// 信任代理（重要！）, 方便后续取出请求的真实IP地址
app.set('trust proxy', true);
// 配置跨域信息
app.use(cors({
        origin: 'http://localhost', // 前端域名
        credentials: true,  // 携带证书、cookie
        methods: 'GET, POST, PUT, DELETE, OPTIONS',
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }
))

// 配置请求体解析器
app.use(express.json())
app.use(express.urlencoded())
// cookie解析器
app.use(cookieParser())
// 日志
// log only 4xx and 5xx responses to console
// 创建文件写入流
const accessLogStream = fs.createWriteStream(path.join(path.resolve(__dirname, '..'), 'logs', 'access.log'), { flags: 'a' })
// 创建原始日志接收器
const tee = new PassThrough()
// 将解析后的日志行同时输出到文件和控制台
tee.pipe(accessLogStream); // 输出到文件
tee.pipe(process.stdout);  // 输出到控制台
//todo 出错邮件
app.use(morgan('common', { stream: tee, skip: (req, res)=>{return res.statusCode < 400}}));
// 仅输出控制台
// app.use(morgan('dev', {
//     skip: function (req, res) { return res.statusCode < 400 }
// }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/user', userController)
app.use('/project', projectController)
app.use('/upload', uploadController)
app.use('/lock', lockController)
app.use('/health', healthController)
app.use(otherErrors)

export default app