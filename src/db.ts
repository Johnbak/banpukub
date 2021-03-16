import { Connection, createConnection } from 'typeorm';

let dbConnection: Connection;

// export const getDBConnection = async () => {
//   if (!dbConnection) {
//     dbConnection = await createConnection({
//       type: 'mssql',
//       host: 'localhost',
//       port: 1433,
//       username: 'sa',
//       password: 'abcABC123',
//       database: 'tempdb',
//       // entityPrefix: process.env.DB_TABLE_PREFIX,
//       entities: [__dirname + '/entity/*.ts'],
//       synchronize: false,
//       logging: true
//     });
//   }
//   return dbConnection;
// };

export const getDBConnection = async () => {
  if (!dbConnection) {
    dbConnection = await createConnection({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(<string>process.env.DB_PORT, 10) || 1433,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      // entityPrefix: process.env.DB_TABLE_PREFIX,
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
