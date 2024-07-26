import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';
import { truncateAllTables } from '../../truncate_db';
import UserFactory from '../../../src/db/factory/user_factory';
import { User } from '../../../src/modules/user';

beforeAll(async () => {
  await truncateAllTables(knex);
  await setup();
});
afterAll(async () => {
  knex.destroy();
});

let user: User;
let token: string;

async function setup() {
  [{ user }] = await new UserFactory().make(knex);

  token = await AuthService.getJwtToken(user.id);
}

describe('POST /api/auth/logout', () => {
  it('can logout with Authorization header', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set({ Authorization: 'Bearer ' + token })
      .expect(200);
  });

  it('can not logout if bad token provided', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set({ Authorization: 'Bearer ' + token + 1 })
      .expect(401);
  });
});
