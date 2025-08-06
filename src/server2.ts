import app from './app.js'
import errorHandler from 'errorhandler'

const PORT = process.env.PORT || 3060

// 返回请求错误信息
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler())
}

app.listen(3092, '0.0.0.0', ()=>{
    console.log(`已启动服务器： http://localhost:3092`);
})