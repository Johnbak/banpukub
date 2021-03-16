import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { ConfigFile } from '../entity/configFile.entity';
import { operationService } from '../services/OperationService';

export class OperationController {
  private configFileRepository = getRepository(ConfigFile);

  // https://github.com/mateusconstanzo/express-typeorm-typescript/blob/master/src/user/service.ts
  all(): Promise<ConfigFile[]> {
    // return operationService.getAll();
    return operationService.getConfigByPlantName('Awaji');
  }
  // async one(request: Request, response: Response, next: NextFunction) {
  //   return this.configFileRepository.findOne(request.params.id);
  // }

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
    // response.json({ success: 'ok kub' });
    return data;
  }

  // async remove(request: Request, response: Response, next: NextFunction) {
  //   // let userToRemove = await this.confsigFileRepository.findOne(request.params.id);
  //   // await this.configFileRepository.remove(userToRemove);
  // }
}
