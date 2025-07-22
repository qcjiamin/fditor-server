import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

function isMulterError(err: any): err is MulterError {
  return err instanceof MulterError;
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(413).send('文件太大，不能超过 10MB');
          case 'LIMIT_FILE_COUNT':
            return res.status(400).send('上传文件数量过多');
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).send('字段名错误');
          default:
            return res.status(400).send(`Multer 错误: ${err.message}`);
        }
    }else{
        res.status(500).send({ errors: [{ message: err.message }] });
    }
};