import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';

let token;

async function setup() {
  // TODO seeder
  const [user] = await knex('users')
    .insert({
      first_name: 'first',
      last_name: 'last',
      email: 'mohanned.kashpour@gmail.com',
      password: await AuthService.hashPassword('123456'),
      status: 'active',
    })
    .returning('*');

  token = await AuthService.getJwtToken(user.id);
}

beforeAll(async () => {
  await knex.migrate.latest({ directory: './src/db/migrations' });
  await setup();
});

afterAll(async () => {
  await knex.destroy();
});

describe('POST /auth/logout', () => {
  it('can logout with Authorization header', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200);
  });

  it('can not logout if bad token provided', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set({ Authorization: 'Bearer ' + token + 1 })
      .expect(401);
  });
});
