import type { Knex } from 'knex';
import dotenv from 'dotenv';

if (!process.env.DATABASE_CLIENT) {
  dotenv.config({ path: '../../.env' });
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DATABASE_CLIENT,
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_USER_PASSWORD,
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
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: process.env.DATABASE_CLIENT,
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_USER_PASSWORD,
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
