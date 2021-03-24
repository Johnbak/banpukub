import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import HttpException from '../common/http-exception';
import { FileUpload } from '../types/FileUpload';
import { operationService } from '../services/OperationService';

export class FileController {

  getFile = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        message: 'Success'
      });
    } catch (e) {
      const errors: HttpException = new HttpException(400, e.message, e);
      next(errors);
    }

  };

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file: any = req.files;
      const listKey = Object.keys(file);
      let list: FileUpload[] = [];
      for (const name of listKey) {
        const fileUpload: FileUpload = {
          name: file[name].name,
          data: file[name].data,
          encoding: file[name].encoding,
          md5: file[name].md5,
          mimetype: file[name].mimetype,
          tempFilePath: '',
          truncated: file[name].truncated,
          mv: file[name].mv,
          size: file[name].size
        };
        list.push(fileUpload);
      }
      const {
        listItemRadiation,
        listItemPowerGeneration,
        listItemRadiationPreview,
        listItemPowerGenerationPreview
      } = await operationService.uploadFile(list, '2021-06-22');

      res.status(200).json({
        listItemPowerGeneration,
        listItemPowerGenerationPreview,
        listItemRadiation,
        listItemRadiationPreview
      });
    } catch (e) {
      next(e);
    }
  };
}