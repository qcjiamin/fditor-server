    import jwt from "jsonwebtoken";
    const secret = 'kjafhkjsal'

    export function generateToken(data: Record<string, any>){
        let created = Math.floor(Date.now() / 1000)
        let token = jwt.sign({
            data,
            ctime: created,
            // exp: created + 60 * 30,
        }, secret, {
            expiresIn: 60
        })
        return token
    }

    type VerifyTokenRsult = {
        success: boolean
    } & Record<string, any>

    export function verifyToken(token:string){
        let res:VerifyTokenRsult | null = null
        try {
            const decordToken = jwt.verify(token, secret)
             res = {
                success: true,
                ...decordToken as jwt.JwtPayload
            }
        } catch (error) {
            res = {
                success: false,
                message: 'token error'
            }
        }
        return res

    }
