"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    const status = error.statusCode || error.status || 500;
    res.status(status).json({
        statusCode: status,
        status: status,
        message: error.message,
        error: error || null
    });
};
exports.errorHandler = errorHandler;
