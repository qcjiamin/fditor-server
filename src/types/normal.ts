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