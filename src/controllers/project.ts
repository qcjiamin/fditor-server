import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { addProject, getProjectById, updateProject, updateProjectNameByID } from "../utils/search.js";
import * as z from 'zod'
import { validataMiddleware } from "../middleware/validata.js";
import { ApiResponse } from "../types/normal.js";

const router = Router()

//todo: 这里对status的限制与 addProject 方法中的类型限制没有统一来源，需要优化
const StatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
const AddProjectBodySchema = z.object({
  project_name: z.string().nonempty(),
  project_data: z.string().nonempty(), // 更严格的配置格式检测？
  // preview_image_url: z.url(),
  status: StatusSchema
})
type AddProjectBody = z.infer<typeof AddProjectBodySchema>
type AddProjectRes = { insertID: number }

router.post('/add', authMiddleware, validataMiddleware(AddProjectBodySchema), async (req:Request<{}, {}, AddProjectBody>, res: Response<ApiResponse<AddProjectRes>>)=>{
  const user_id = req.userInfo!.data.id
  const {project_name, project_data, status} = {...req.body}
  const insertID = await addProject({
    user_id: user_id,
    project_name: project_name,
    project_data: project_data,
    // preview_image_url: preview_image_url,
    status: status
  })
  res.status(201).send({
    insertID
  })
})

const SaveProjectBodySchema = z.object({
  id: z.number().gte(1),
  project_data: z.string().nonempty(), // 更严格的配置格式检测？
  preview_image_url: z.url()
})
type SaveProjectBody = z.infer<typeof SaveProjectBodySchema>
router.post('/save', authMiddleware, validataMiddleware(SaveProjectBodySchema), async (req:Request<{}, {}, SaveProjectBody>, res:Response<ApiResponse>)=>{
  const {id, project_data, preview_image_url} = {...req.body}
  await updateProject({
    id,
    project_data: project_data,
    preview_image_url: preview_image_url,
  })
  res.status(200).send({})
})

const GetProjectBodySchema = z.object({
  id: z.string()
       .regex(/^\d+$/, 'ID must be number') // 确保字符串可转为数字
       .transform(Number)
       .refine((num)=> !isNaN(num) && num > 0, 'ID need > 0')
})
// params 必须为 Record<string, string>
// type GetProjectBody = z.infer<typeof GetProjectBodySchema>;
type GetProjectByIDRes = {
  // project_data: Record<string, any>,
  project_data: string,
  project_name: string
}
router.get('/get/:id', authMiddleware, validataMiddleware(GetProjectBodySchema, 'params'), async (req: Request<{id: string}>, res: Response<ApiResponse<GetProjectByIDRes>>)=>{
  const { id } = req.params;
  const project = await getProjectById(Number(id))
  if(!project){
    res.status(404).json({
      message: 'do not find project by id'
    });
    return
  }
  res.status(200).json({
      project_data: project.project_data,
      project_name: project.project_name,
  })
})

const ModifyProjectNameBodySchema = z.object({
  id: z.number().gte(1),
  name: z.string().nonempty()
})
type ModifyProjectNameBody = z.infer<typeof ModifyProjectNameBodySchema>;
router.post('/update/projectName', authMiddleware, validataMiddleware(ModifyProjectNameBodySchema), async (req: Request<{}, {}, ModifyProjectNameBody>, res:Response<ApiResponse>)=>{
  const {id, name} = req.body
  // 执行语句
  await updateProjectNameByID(id, name)
  res.status(200).json({})
})

export default router