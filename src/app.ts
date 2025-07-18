import express from "express"
import cors from 'cors'
import userController from './controllers/user'
import morgan from "morgan"
import fs from 'fs'
import path  from "path"
import split from "split2"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PassThrough } from "stream"

// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);

const app = express()

// 配置跨域信息
app.use(cors())
// 配置请求体解析器
app.use(express.json())
app.use(express.urlencoded())
// 日志
// log only 4xx and 5xx responses to console

// 创建文件写入流
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// 创建一个可读流（用于解析日志行）
const splitStream = split();

// 创建原始日志接收器
const rawStream = new PassThrough()
// 将 rawStream 中的数据末尾加 \n 后传入 split
rawStream.on('data', (chunk) => {
  // chunk 是 Buffer 或 string
  const log = chunk.toString()
  const str = log.trimEnd() + '\n'

  splitStream.write(log.trimEnd() + '\n')
})

// 将解析后的日志行同时输出到文件和控制台
splitStream.pipe(accessLogStream); // 输出到文件
splitStream.pipe(process.stdout);  // 输出到控制台
// 配置 morgan 使用 splitStream 作为输出目标
app.use(morgan('common', { stream: rawStream }));
// 仅输出控制台
// app.use(morgan('dev', {
//     skip: function (req, res) { return res.statusCode < 400 }
// }))

app.use('/user', userController)

export default app