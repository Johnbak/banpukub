"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(statusCode, message, error) {
        super(message);
        this.statusCode = statusCode;
        this.error = error || null;
        this.message = message;
    }
}
exports.default = HttpException;
