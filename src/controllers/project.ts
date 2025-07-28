import { Router, Request } from "express";
import { authMiddleware } from "../middleware/auth";
import { addProject, getProjectById, updateProject } from "../utils/search";

const router = Router()

router.get('/:id', (req, res, next)=>{
    setTimeout(() => {
        try {
          throw new Error('BROKEN')
        } catch (err) {
          next(err)
        }
    }, 100)
})

router.post('/add', authMiddleware, async (req:Request, res, next)=>{
  const user_id = req.userInfo!.data.id
  const {project_name, project_data, preview_image_url, status} = {...req.body}
  await addProject({
    user_id: user_id,
    project_name: project_name,
    project_data: project_data,
    preview_image_url: preview_image_url,
    status: status
  })
  res.status(201).send()
})

router.post('/save', authMiddleware, async (req:Request, res, next)=>{
  // const user_id = req.userInfo!.data.id
  const {project_data, preview_image_url} = {...req.body}
  await updateProject({
    project_data: project_data,
    preview_image_url: preview_image_url,
  })
  res.status(201).send()
})

router.get('/get/:id', authMiddleware, async (req: Request, res, next)=>{
  const { id } = req.params;
  // 验证 id 是否存在且格式正确（假设 id 为数字）
  if (!id || isNaN(Number(id))) {
    res.status(400).json({ message: '无效的项目 ID' });
  }

  const project = await getProjectById(Number(id))
  if(!project){
    res.status(404).json({ message: '项目不存在' });
  }
  res.status(200).json({
    config: project?.project_data
  })
})

export default router