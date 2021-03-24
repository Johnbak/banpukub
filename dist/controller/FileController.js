"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const http_exception_1 = __importDefault(require("../common/http-exception"));
const OperationService_1 = require("../services/OperationService");
class FileController {
    constructor() {
        this.getFile = (req, res, next) => {
            try {
                res.status(200).json({
                    message: 'Success'
                });
            }
            catch (e) {
                const errors = new http_exception_1.default(400, e.message, e);
                next(errors);
            }
        };
        this.upload = async (req, res, next) => {
            try {
                const file = req.files;
                const listKey = Object.keys(file);
                let list = [];
                for (const name of listKey) {
                    const fileUpload = {
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
                const result = await OperationService_1.operationService.uploadFile(list, '2021-06-22');
                res.send(result);
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.FileController = FileController;
