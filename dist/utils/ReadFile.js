"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckFileType = void 0;
const List = [
    'application/vnd.ms-excel',
    'text/csv'
];
const CheckFileType = (file) => {
    try {
        if (List.find(value => value === file.mimetype)) {
            return file;
        }
        else {
            const error = new Error('invalid file type');
            throw error;
        }
    }
    catch (e) {
        throw e;
    }
};
exports.CheckFileType = CheckFileType;
