export interface UploadFile {
  user_id: number      // 必选，数字类型
  file_name: string    // 
  file_path: string    // 
  file_size: number    // 文件大小（字节）
  file_type: string    // MIME类型
  extension?: string
  is_temp?: 0 | 1      // 状态（1=正常，0=禁用）
  upload_ip?: string
}