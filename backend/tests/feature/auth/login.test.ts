import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';

beforeAll(async () => {
  await knex.migrate.latest({ directory: './src/db/migrations' });
  await setup();
});

afterAll(async () => {
  await knex.destroy();
});

async function setup() {
  //TODO seeder
  await knex('users')
    .insert({
      first_name: 'first',
      last_name: 'last',
      email: 'mohanned.kashpour@gmail.com',
      password: await AuthService.hashPassword('123456'),
      status: 'active',
    })
    .returning('*');
}

describe('POST /auth/login', () => {
  it('give an error if invalid data provided', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'mohanned.kashpour',
      })
      .expect(422);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject([
      {
        path: '/password',
      },
      {
        path: '/email',
      },
    ]);
  });

  it('can not login with wrong cred', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'mohanned.kashpour@gmail.com',
        password: '12345611',
      })
      .expect(401);
  });

  it('can login with correct cred', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'mohanned.kashpour@gmail.com',
        password: '123456',
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });
});
