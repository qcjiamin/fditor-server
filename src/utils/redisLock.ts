
import {Redis} from 'ioredis'
import {v4} from 'uuid'

// 从环境变量获取配置，默认本地 Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // 优先从环境变量获取
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379, // 端口默认 6379
  // 其他可选配置（也可从环境变量获取）
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
});

export async function setValue(key: string, value: string){
  await redis.set(key, value)
}
export async function getValue(key: string){
  const value = await redis.get(key)
  return value
}

// export class RedisLock {
//   async acquire(lockKey:string, expireSeconds = 10, waitTimeout = 5000) {
//     const lockValue = v4();
//     const start = Date.now();
    
//     while (Date.now() - start < waitTimeout) {
//       // 尝试获取锁
//       const result = await redis.set(
//         lockKey,
//         lockValue,
//         'PX',
//         expireSeconds,
//         'NX'
//         // expireSeconds
//       );
      
//       if (result === 'OK') return lockValue;
//       await new Promise(resolve => setTimeout(resolve, 100));
//     }
    
//     return null;
//   }
  
//   async release(lockKey:string, lockValue:string) {
//     if (!lockValue) return false;
    
//     const script = `
//       if redis.call('get', KEYS[1]) == ARGV[1] then
//         return redis.call('del', KEYS[1])
//       else
//         return 0
//       end
//     `;
    
//     const result = await redis.eval(script, 1, lockKey, lockValue);
//     return result === 1;
//   }
// }

