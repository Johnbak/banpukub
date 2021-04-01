import { getRepository } from 'typeorm';
const XLSX = require('xlsx');
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
  readBudget = (req:Request, res:Response, next:NextFunction)=> {
    try {
      const file: any = req.files;
      //read workbook
      const workBook = XLSX.read(file.file.data, { dateNF: 'M/d/YY HH:mm' });
      //get sheet number
      const sheetName = workBook.SheetNames[29-1];
      // //get sheet name
      const sheet = workBook.Sheets[sheetName];

      let range = XLSX.utils.decode_range(sheet['!ref']);
      let header = []
      for (let i = 55; i < 83 ; i++) {
        let cell_ref = XLSX.utils.encode_cell({
          "c": 0,
          "r": i
        });
        header.push(XLSX.utils.format_cell(sheet[cell_ref]))

      }
      let result = []
      for (let i = 0; i < 12 ; i++) {
        let subResult = []
        for (let i = 55; i < 83 ; i++) {
          let cell_ref = XLSX.utils.encode_cell({
            "c": 5,
            "r": i
          });
          subResult.push(XLSX.utils.format_cell(sheet[cell_ref]))

        }
        result.push(subResult)
      }

      res.status(200).json({
        message:'OK',
        // sheetNameList:workBook.SheetNames,
        sheetName:sheetName,
        range:range,
        header:header,
        result:result
      })
    } catch (e) {
      next(e)
    }
  }
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