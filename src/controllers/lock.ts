import { Router, Request, Response } from "express";
import { validataMiddleware } from "../middleware/validata.js";
import * as z from 'zod'
import { ApiResponse } from "../types/normal.js";
import fs from 'fs/promises'
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { getValue, setValue } from "../utils/redisLock.js";
import { Job, Queue, QueueEvents } from "bullmq";
import {Redis} from 'ioredis'
import { configDotenv } from 'dotenv'
configDotenv()

const LOCK_WRITE_KEY = 'write:lock'

const router = Router()

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


router.post('/set', async (req:Request, res: Response)=>{
  const {key, value} = req.body
  await setValue(key, value)
  res.status(200).send()
})
router.get('/get/:key', async (req:Request, res: Response)=>{
  const {key} = req.params
  const value = await getValue(key)
  res.status(200).send({
    value
  })
})

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
  maxRetriesPerRequest: null
});

// console.log(typeof process.env.REDIS_PASSWORD)
const testQueue = new Queue('test', {
  connection: redis
});
// testQueue.on('')
const testQueueEvents = new QueueEvents('test', {
  connection: redis
})
testQueueEvents.on('completed', (job)=>{
  console.log(job.jobId, job.returnvalue, 'completed')
})
testQueueEvents.on('failed', (job)=>{
  console.log(job.jobId, job.failedReason, 'failed')
})
testQueueEvents.on('progress', ({jobId, data}) => {
  // jobId received a progress event
  console.log(`job ${jobId} ${data}`)
});

router.post('/task', async (req:Request, res: Response)=>{
  //data: {num1:1, num2:2}
  const {data} = {...req.body}

  const addres = await testQueue.add('taskType1', data, {
    removeOnComplete: true, // 完成自动删除
    removeOnFail: true // 失败自动删除
  })
  // 添加任务后，任务进度默认为0
  addres.updateProgress(0)

  res.status(200).send({
    taskid: addres.id
  })
})

router.get('/task/status/:taskid', async (req, res)=>{
  const {taskid} = req.params
  const job = await testQueue.getJob(taskid) as Job
  const state = await job.getState()
  const progress = await job.progress
  res.status(200).send({
    state,
    progress
  })
})

export default router