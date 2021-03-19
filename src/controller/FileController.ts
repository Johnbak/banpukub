import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import HttpException from '../common/http-exception';

export class FileController {

  getFile = (req:Request, res:Response, next:NextFunction) => {
    try {
      res.status(200).json({
        message:'Success'
      })
    } catch (e) {
        const errors:HttpException = new HttpException(400, e.message, e)
        next(errors)
    }

  }
}