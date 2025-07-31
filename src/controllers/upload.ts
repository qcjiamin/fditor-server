import {  Router, Request, Response } from "express";
import multer from 'multer'
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs'
import { uploadErrors } from "../errorHandler/uploadErrors";
import { authMiddleware } from "../middleware/auth";
import { insertNewFile } from "../utils/search";
import { ApiResponse } from "../types/normal";
import { randomUUID } from "crypto";
import * as z from 'zod'
import { validataMiddleware } from "../middleware/validata";

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
        if(!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath, {recursive: true})
        }
        cb(null, folderPath)
    },
    // 保存名字
    filename: function(req, file, cb){
      cb(null, randomUUID() + path.extname(file.originalname))
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

type UploadFileRes = { url: string }
router.post('/file', authMiddleware, upload.single('file'), async (req: Request, res: Response<ApiResponse<UploadFileRes>>)=>{
  const user_id = req.userInfo!.data.id
  if(!req.file){
    return res.status(400).json({
      message: 'upload file but do not have file'
    })
  }
  const fileinfo = req.file
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
  res.status(201).send({
      url: fileAddress
  })
})


const coverStorage = multer.diskStorage({
  destination: function(req, file, cb){
    const folderPath = path.join(__dirname, '..', `uploads/covers`)
    console.log('folder path', folderPath)
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }
    cb(null, folderPath)
  },
  filename: async function(req:Request<{},{}, UploadCoverBody>, file, cb){
    console.log(req.body)
    // 使用cover-工程id.png 来命名工程的封面图，工程id唯一不可变，所以封面图可以覆盖上次上传的
    cb(null, `cover-${req.body.projectID}${path.extname(file.originalname)}`)
  }
})
const coverUpload = multer({
    storage: coverStorage,
    fileFilter: (req, file, callback) => {
        // 检查文件的 MIME 类型，例如只接受图像文件
        if (file.mimetype.startsWith('image/')) {
          callback(null, true); // 接受文件
        } else {
          callback(new Error('do not support file type')); // 拒绝文件
        }
    },
})

const UploadCoverBodySchema = z.object({
  // formdata只能传递string
  projectID: z.string().transform(Number).refine((num) => num >= 1, {
      message: 'ProjectID need >= 1',
    }),
})
type UploadCoverBody = z.infer<typeof UploadCoverBodySchema>;
router.post('/cover', authMiddleware, coverUpload.single('file'), validataMiddleware(UploadCoverBodySchema), async (req: Request, res: Response)=>{
  // 手动验证参数

  if(!req.file){
    return res.status(400).json({
      message: 'upload file but do not have file'
    })
  }
  const fileAddress = `${req.protocol}://${req.get('host')}/uploads/covers/${req.file.filename}`;
  res.status(201).send({
      url: fileAddress
  })
})

// 拦截 multer 报错
router.use(uploadErrors);


export default router