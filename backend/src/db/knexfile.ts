import type { Knex } from 'knex';
import dotenv from 'dotenv';

const originalEnv = process.env;
if (!process.env.DATABASE_CLIENT) {
  dotenv.config({ path: '../../.env' });
}
process.env.NODE_EVN = originalEnv.NODE_ENV;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: originalEnv.DATABASE_CLIENT ?? process.env.DATABASE_CLIENT,
    connection: {
      host: originalEnv.DATABASE_HOST ?? process.env.DATABASE_HOST,
      port:
        originalEnv.DATABASE_PORT ?? process.env.DATABASE_PORT
          ? parseInt(originalEnv.DATABASE_PORT ?? process.env.DATABASE_PORT!)
          : undefined,
      database: originalEnv.DATABASE_NAME ?? process.env.DATABASE_NAME,
      user: originalEnv.DATABASE_USER ?? process.env.DATABASE_USER,
      password: originalEnv.DATABASE_USER_PASSWORD ?? process.env.DATABASE_USER_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  test: {
    client: originalEnv.DATABASE_CLIENT ?? process.env.DATABASE_CLIENT,
    connection: {
      host: originalEnv.TEST_DATABASE_HOST ?? process.env.TEST_DATABASE_HOST,
      port:
        originalEnv.TEST_DATABASE_PORT ?? process.env.TEST_DATABASE_PORT
          ? parseInt(originalEnv.TEST_DATABASE_PORT ?? process.env.TEST_DATABASE_PORT!)
          : undefined,
      database: originalEnv.TEST_DATABASE_NAME ?? process.env.TEST_DATABASE_NAME,
      user: originalEnv.TEST_DATABASE_USER ?? process.env.TEST_DATABASE_USER,
      password: originalEnv.TEST_DATABASE_USER_PASSWORD ?? process.env.TEST_DATABASE_USER_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: originalEnv.DATABASE_CLIENT ?? process.env.DATABASE_CLIENT,
    connection: {
      host: originalEnv.DATABASE_HOST ?? process.env.DATABASE_HOST,
      port:
        originalEnv.DATABASE_PORT ?? process.env.DATABASE_PORT
          ? parseInt(originalEnv.DATABASE_PORT ?? process.env.DATABASE_PORT!)
          : undefined,
      database: originalEnv.DATABASE_NAME ?? process.env.DATABASE_NAME,
      user: originalEnv.DATABASE_USER ?? process.env.DATABASE_USER,
      password: originalEnv.DATABASE_USER_PASSWORD ?? process.env.DATABASE_USER_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

export default config;
