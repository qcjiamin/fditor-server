import { Router, Request, Response } from "express";
import { Redis } from 'ioredis';

const router = Router()

// 可选：检查依赖服务，如 Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
  maxRetriesPerRequest: null
});

router.get('/check', async (req, res) => {
  try {
    // 检查 Redis 连接
    // await redis.ping();
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health check failed:',  (err as Error)?.message ?? String(err));
    res.status(500).json({ status: 'error', error: (err as Error)?.message ?? 'UnKnow error' });
  }
});

export default router