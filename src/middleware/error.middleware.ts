import { Request, Response, NextFunction } from 'express';
import HttpException from '../common/http-exception'


export const errorHandler = (error: HttpException, req:Request, res:Response, next: NextFunction) => {
  const status = error.statusCode || error.status || 500;

  res.status(status).json({
    statusCode:status,
    status: status,
    message: error.message,
    error: error || null
  })

}