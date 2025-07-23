import { Router } from "express";

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

export default router