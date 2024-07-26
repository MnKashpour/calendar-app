import knex from 'knex';
import dbConfig from './knexfile';
const knexStringCase = require('knex-stringcase');

let config;

switch (process.env.NODE_ENV) {
  case 'test':
    config = dbConfig.test;
    break;
  case 'development':
    config = dbConfig.development;
    break;
  case 'production':
    config = dbConfig.production;
    break;
  default:
    throw Error('Unknown NODE_ENV: ' + process.env.NODE_ENV);
    break;
}

const options = knexStringCase(config);

export default knex(options);
