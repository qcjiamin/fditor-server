    import jwt from "jsonwebtoken";
    export const secret = 'kjafhkjsal'

    export function generateToken(data: Record<string, any>){
        let created = Math.floor(Date.now() / 1000)
        let token = jwt.sign({
            data,
            ctime: created,
            // exp: created + 60 * 30,
        }, secret, {
            // expiresIn: 60
        })
        return token
    }

    export function verifyToken(token:string){
        try {
            const decordToken = jwt.verify(token, secret)
            return true
        } catch (error) {
            return false
        }

    }
