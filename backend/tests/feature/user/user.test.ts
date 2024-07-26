import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import UserFactory from '../../../src/db/factory/user_factory';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';
import { truncateAllTables } from '../../truncate_db';
import { User } from '../../../src/modules/user';

beforeAll(async () => {
  await truncateAllTables(knex);
  await setup();
});
afterAll(async () => {
  knex.destroy();
});

let authUser: User;
let user: User;
let token: string;

async function setup() {
  [{ user: authUser }, { user }] = await new UserFactory().make(knex, 2);

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /api/users/:id', () => {
  it('return 404 if invalid id is sent', async () => {
    const res = await request(app)
      .get(`/api/users/e`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });

  it('return 404 if valid but incorrect id is sent', async () => {
    const res = await request(app)
      .get(`/api/users/0`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });

  it('return 401 if not authorized', async () => {
    const res = await request(app).get(`/api/users/${user.id}`).expect(401);
  });

  it('can get the user with correct id', async () => {
    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    expect(res.body).toMatchObject({
      id: user.id,
      email: user.email,
    });
  });
});

describe('GET /api/users/me', () => {
  it('return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/me').expect(401);
  });

  it('get the authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    expect(res.body).toMatchObject({
      id: authUser.id,
      email: authUser.email,
    });
  });
});
