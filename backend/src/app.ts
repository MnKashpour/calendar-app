/*
 ** --------------------------------------------
 ** Configurations
 ** --------------------------------------------
 */

import dotenv from 'dotenv';

dotenv.config();

/*
 ** --------------------------------------------
 ** App initialization
 ** --------------------------------------------
 */

import express, { Express } from 'express';

const app: Express = express();

/*
 ** --------------------------------------------
 ** Middlewares before routes
 ** --------------------------------------------
 */

import morganLogger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import empty_fields_to_null from './middleware/empty_fields_to_null';

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(empty_fields_to_null);

if (process.env.NODE_ENV === 'development') {
  app.use(morganLogger('dev'));
}

/*
 ** --------------------------------------------
 ** Define routes
 ** --------------------------------------------
 */

import router from './router';

app.use('/api', router);

/*
 ** --------------------------------------------
 ** Handle 404
 ** --------------------------------------------
 */

app.all('*', (req, res, next) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

/*
 ** --------------------------------------------
 ** Middlewares after routes
 ** --------------------------------------------
 */

import errorHandler from './middleware/error_handler';

app.use(errorHandler);

/*
 ** --------------------------------------------
 */

export default app;
