import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express, { json, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import {encode, decode} from 'html-entities';

import {errorHandler} from './middleware/error.middleware';
import {notFoundHandler} from './middleware/not-found.middleware';
import { CheckFileType } from './utils/ReadFile'
// import { Routes } from './routes';
import { User } from './entity/User';
import { getDBConnection } from './db';
import { AppRoutes } from './routes';
import dotenv from 'dotenv';
import compression from 'compression';
import fileUpload = require('express-fileupload');
import { FileArray } from 'express-fileupload';
dotenv.config();

const portNumber: number = parseInt(process.env.PORT || '3000', 10);
getDBConnection().then(async () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(compression());
  app.use(fileUpload());

  // Routes
  AppRoutes.forEach((route) => {
    (app as any)[route.method](
      route.route,
      (req: Request, res: Response, next: Function) => {
        const result = new (route.controller as any)()[route.action](
          req,
          res,
          next
        );
        if (result instanceof Promise) {
          result.then((result) =>
            result !== null && result !== undefined
              ? res.send(result)
              : undefined
          );
        } else if (result !== null && result !== undefined) {
          res.json(result);
        }
      }
    );
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  app.listen({ port: portNumber }, () =>
    console.log(`🚀 Server ready at http://localhost:${portNumber}`)
  );
});
