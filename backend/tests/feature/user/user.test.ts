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

let authUser;
let user;
let token;

async function setup() {
  //TODO seeder
  [authUser] = await knex('users')
    .insert({
      first_name: 'first',
      last_name: 'last',
      email: 'mohanned.kashpour@gmail.com',
      password: await AuthService.hashPassword('123456'),
      status: 'active',
    })
    .returning('*');

  [user] = await knex('users')
    .insert({
      first_name: 'second',
      last_name: 'second to last',
      email: 'mohanned@gmail.com',
      password: await AuthService.hashPassword('123456'),
      status: 'active',
    })
    .returning('*');

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /users/:id', () => {
  it('return 404 if invalid id is sent', async () => {
    const res = await request(app)
      .get(`/users/e`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });

  it('return 404 if valid but incorrect id is sent', async () => {
    const res = await request(app)
      .get(`/users/0`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });

  it('return 401 if not authorized', async () => {
    const res = await request(app).get(`/users/${user.id}`).expect(401);
  });

  it('can get the user with correct id', async () => {
    const res = await request(app)
      .get(`/users/${user.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: user.email,
    });
  });
});

describe('GET /users/me', () => {
  it('return 401 if not authenticated', async () => {
    const res = await request(app).get('/users/me').expect(401);
  });

  it('get the authenticated user', async () => {
    const res = await request(app)
      .get('/users/me')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      id: authUser.id,
      email: authUser.email,
    });
  });
});
