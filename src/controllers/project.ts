import { Router, Request } from "express";
import { authMiddleware } from "../middleware/auth";
import { addProject } from "../utils/search";

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
  res.status(201).end
})

export default router