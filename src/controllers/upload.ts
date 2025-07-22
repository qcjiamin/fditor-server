import { Router } from "express";
import multer from 'multer'
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs'
// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);
const router = Router()

const storage = multer.diskStorage({
    // 保存路径
    destination: function(req, file, cb){
        let type = ''
        if(file.mimetype && file.mimetype.startsWith('image/')){
            type = 'image'
        }

        if(type === ''){
            cb(new TypeError('do not support file type'), '')
        }
        const folderPath = path.join(__dirname, `upload/${type}`)
        if(!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath)
        }
        cb(null, folderPath)
    },
    // 保存名字
    filename: function(req, file, cb){
      //todo: 需要保证唯一性
      cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        // 检查文件的 MIME 类型，例如只接受图像文件
        if (file.mimetype.startsWith('image/')) {
          callback(null, true); // 接受文件
        } else {
          callback(new Error('do not support file type')); // 拒绝文件
        }
    },
})

router.get('/img', upload.single('file'), (req, res, next)=>{
  const fileAddress = `${req.protocol}://${req.get('host')}${req.originalUrl}image/${req.file!.filename}`;
  res.send({
      succcess: true,
      url: fileAddress
  })
})


export default router