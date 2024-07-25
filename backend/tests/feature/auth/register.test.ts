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
  // TODO seeder
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

describe('POST /auth/register', () => {
  it('give an error if invalid data provided', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'mohanned.kashpour',
      })
      .expect(422);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject([
      {
        path: '/firstName',
      },
      {
        path: '/lastName',
      },
      {
        path: '/password',
      },
      {
        path: '/email',
      },
    ]);
  });

  it('can not register with already used email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Mohanned',
        lastName: 'Kashpour',
        email: 'mohanned.kashpour@gmail.com',
        password: '12345611',
      })
      .expect(422);
  });

  it('can register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Mohanned',
        lastName: 'Kashpour',
        email: 'mohanned.kashpour1@gmail.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('token');

    expect(await knex('users').orderBy('id', 'desc').first()).toMatchObject({
      firstName: 'Mohanned',
      lastName: 'Kashpour',
      email: 'mohanned.kashpour1@gmail.com',
    });
  });
});
