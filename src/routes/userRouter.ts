import { Router } from "express";
 const router = Router()

router.get('/login', (req, res, next)=>{
    res.send('login')
})

export default router