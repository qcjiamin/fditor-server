import {  Router, Request } from "express";
import multer from 'multer'
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs'
import { uploadErrors } from "../errorHandler/uploadErrors";
import { authMiddleware } from "../middleware/auth";
import { insertNewFile } from "../utils/search";
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
        const folderPath = path.join(__dirname, '..', `uploads/${type}`)
        console.log('folder path', folderPath)
        if(!fs.existsSync(folderPath)){
          console.log('mkdir')
            fs.mkdirSync(folderPath, {recursive: true})
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

router.post('/file', authMiddleware, upload.single('file'), async (req: Request, res, next)=>{
  const user_id = req.userInfo!.data.id
  const fileinfo = req.file!
  //todo 添加到数据库中
  await insertNewFile({
    user_id,
    file_name: fileinfo.filename,
    file_path: fileinfo.path,
    file_size: fileinfo.size,
    file_type: fileinfo.mimetype,
    upload_ip: req.ip
  })

  const type = req.file!.mimetype.split('/')[0]
  const fileAddress = `${req.protocol}://${req.get('host')}/uploads/${type}/${req.file!.filename}`;
  res.send({
      success: true,
      url: fileAddress
  })
})

router.use(uploadErrors);


export default router