"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationController = void 0;
const typeorm_1 = require("typeorm");
const configFile_entity_1 = require("../entity/configFile.entity");
const OperationService_1 = require("../services/OperationService");
class OperationController {
    constructor() {
        this.configFileRepository = typeorm_1.getRepository(configFile_entity_1.ConfigFile);
    }
    all() {
        try {
            return OperationService_1.operationService.getConfigByPlantName('Awaji');
        }
        catch (e) {
        }
    }
    async save(request, response, next) {
        try {
            console.log(request);
        }
        catch (err) {
            response.status(400);
            response.json({ error: err.message });
        }
        return await this.configFileRepository.save(request.body);
    }
    async upload(request, response, next) {
        let data = OperationService_1.operationService.upload(request, request.body.date);
        console.log(request.body.date);
        response.status(200);
        return data;
    }
}
exports.OperationController = OperationController;
