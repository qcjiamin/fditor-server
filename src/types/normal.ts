    export interface TokenBaseInfo{
        ctime: number,
        iat: number,
        exp: number,
    }
    export interface UserDataInToken{
        id: number
        username: string
    }
    /** 定义用户登录时token中保存的数据结构 */
    export interface TokenUserInfo extends TokenBaseInfo{
        data: UserDataInToken
    }


// 通用成功响应(带data)
export interface SuccessResponse<T> {
  success: true;
//   code: 200;
  data: T;
  message?: string;
}
// 通用成功响应(不带data)
export interface EmptyResponse {
  success: true;
//   code: 200;
  message?: string; // 强制要求提供消息
}


// 通用错误响应
export interface ErrorResponse {
    message: string;
    details?: any;
}

// 联合类型：响应要么成功要么失败
export type ApiResponse<T={}> = T | ErrorResponse;