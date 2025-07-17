import express from "express"
import cors from 'cors'
import router from './routes/userRouter'

const app = express()
const PORT = process.env.PORT || 3060

// 配置跨域信息
app.use(cors())
// 配置请求体解析器
app.use(express.json())
app.use(express.urlencoded())

app.use('/user', router)

app.listen(PORT, ()=>{
    console.log(`服务器运行在端口 ${PORT}`);
})