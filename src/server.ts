import './utils/envload.js'
// loadEnv()
import app from './app.js'
import errorHandler from 'errorhandler'

console.log(process.env.PORT)
const PORT = process.env.PORT || 3090

// 返回请求错误信息
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler())
}

app.listen(PORT as number, '0.0.0.0', ()=>{
    console.log(`已启动服务器： http://localhost:${PORT}`);
})