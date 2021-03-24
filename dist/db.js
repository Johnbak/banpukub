"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDBConnection = void 0;
const typeorm_1 = require("typeorm");
let dbConnection;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await typeorm_1.createConnection({
            type: 'mssql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 1433,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            entities: [__dirname + '/entity/*.ts'],
            synchronize: false,
            logging: process.env.DB_LOGGING === 'true',
            options: {
                encrypt: true,
                enableArithAbort: true
            }
        });
    }
    return dbConnection;
};
exports.getDBConnection = getDBConnection;
