import { execQuery } from "./db";
import type { User, UserCreateNeedProperty } from '../types/user';
import { OkPacketParams } from "mysql2";
import type{ UploadFile } from "../types/file";
import path from "path";
import { ProjectProperty, SaveProjectProperty } from "src/types/project";

export async function findUserByUsername(username:string) {
    // 执行 SQL 查询，使用占位符防止 SQL 注入
    const rows = await execQuery<User>('select * from users where username=?', [username])
    
    // 返回查询结果（如果存在）
    return rows.length > 0 ? rows[0] : null;
}

export async function findUserByEmail(email:string) {
    // 执行 SQL 查询，使用占位符防止 SQL 注入
    const rows = await execQuery<User>('select * from users where email=?', [email])
    
    // 返回查询结果（如果存在）
    return rows.length > 0 ? rows[0] : null;
}

export async function createUser(info:UserCreateNeedProperty){
    await execQuery('INSERT INTO users (username, password_hash, email, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [info.username, info.password_hash, info.email])
}

export async function insertNewFile(info: UploadFile){
    const ext = path.extname(info.file_name).split('.')[1]
    const istemp = Object.hasOwnProperty.call(info, 'is_temp') ? info.is_temp : 1
    const ip = info.upload_ip ?? ''
    await execQuery('INSERT INTO file_uploads (user_id, file_name,file_path, file_size, file_type, extension, is_temp, upload_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [info.user_id, info.file_name, info.file_path, info.file_size,info.file_type, ext, istemp, ip])
}



export async function addProject(info: ProjectProperty){
    const previewImg = info.preview_image_url ?? ''
    await execQuery('INSERT INTO projects (user_id, project_name, project_data, preview_image_url, status) VALUES (?, ?, ?, ?, ?)', [info.user_id, info.project_name, info.project_data, previewImg, info.status])
}

export async function updateProject(info: SaveProjectProperty){
    const previewImg = info.preview_image_url ?? ''
    await execQuery('UPDATE INTO projects (project_name, project_data, preview_image_url) VALUES (?, ?, ?)', [info.project_data, previewImg])
}

export async function getProjectById(id: number){
    // 执行 SQL 查询，使用占位符防止 SQL 注入
    const rows = await execQuery<ProjectProperty>('select * from projects where id=?', [id])
    
    // 返回查询结果（如果存在）
    return rows.length > 0 ? rows[0] : null;
}