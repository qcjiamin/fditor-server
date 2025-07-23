export interface User {
  id: number;          // 必选，数字类型
  username: string;    // 必选，字符串类型
  password_hash: string; // 必选，密码哈希
  email: string;       // 必选，邮箱
  created_at: string;  // 必选，创建时间（ISO 字符串）
  // 其他可选字段（如 nickname、status 等）
  nickname?: string;
  status?: number;
}

export type UserCreateNeedProperty = Omit<User, 'id' | 'created_at'> & Record<'password_salt', string>