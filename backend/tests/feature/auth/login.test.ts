import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { truncateAllTables } from '../../truncate_db';
import { User } from '../../../src/modules/user';
import UserFactory from '../../../src/db/factory/user_factory';

beforeAll(async () => {
  await truncateAllTables(knex);
  await setup();
});
afterAll(async () => {
  knex.destroy();
});

let user: User;

async function setup() {
  [{ user }] = await new UserFactory().make(knex);
}

describe('POST /api/auth/login', () => {
  it('give an error if invalid data provided', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'mohanned.kashpour',
      })
      .expect(422);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toMatchObject([
      {
        property: 'password',
      },
      {
        property: 'email',
      },
    ]);
  });

  it('can not login with wrong cred', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: '12345677777',
      })
      .expect(400);
  });

  it('can login with correct cred', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: '123456',
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });
});
