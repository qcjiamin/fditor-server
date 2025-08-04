import { Router, Request, Response } from "express";
import { validataMiddleware } from "../middleware/validata.js";
import * as z from 'zod'
import { ApiResponse } from "../types/normal.js";
import fs from 'fs/promises'
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { RedisLock } from "../utils/redisLock.js";
const LOCK_WRITE_KEY = 'write:lock'

const router = Router()
const lock = new RedisLock();

function sleep(time: number):Promise<void>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve()
        }, time);
    })
}
// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, 'example.txt');

const WriteBodySchema = z.object({
  content: z.string().nonempty(),
})
type WriteBody = z.infer<typeof WriteBodySchema>
type WriteRes = { insertID: number }
router.post('/write', validataMiddleware(WriteBodySchema), async (req:Request<{}, {}, WriteBody>, res: Response<ApiResponse<WriteRes>>)=>{
  const {content} = {...req.body}
  // 取锁
  const acquireRes = await lock.acquire(LOCK_WRITE_KEY, 10000)
  if(acquireRes){
    setTimeout(async () => {
        await fs.appendFile(filePath, '\n'+content, "utf-8")
        lock.release(LOCK_WRITE_KEY, acquireRes)
    }, 2000);
  }
  // 解锁

  res.status(200).send()
})

export default router