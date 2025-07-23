import { NextFunction, Request, Response } from "express";


export const otherErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500)
    res.send(err.message)
};