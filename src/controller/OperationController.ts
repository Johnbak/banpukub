import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { ConfigFile } from '../entity/configFile.entity';
import { operationService } from '../services/OperationService';

export class OperationController {
  private configFileRepository = getRepository(ConfigFile);

  // https://github.com/mateusconstanzo/express-typeorm-typescript/blob/master/src/user/service.ts
  all() {
    // return operationService.getAll();
    try {

      return operationService.getConfigByPlantName('Awaji');
      // return operationService.getAllList()
    } catch (e) {

    }
  }

  async save(request: Request, response: Response, next: NextFunction) {
    // return operationService.createUser(request.body);
    try {
      console.log(request);
    } catch (err) {
      response.status(400);
      response.json({ error: err.message });
    }
    return await this.configFileRepository.save(request.body);
  }

  async upload(request: Request, response: Response, next: NextFunction) {
    let data = operationService.upload(request, request.body.date);
    console.log(request.body.date);
    response.status(200);
    return data;
  }
}
