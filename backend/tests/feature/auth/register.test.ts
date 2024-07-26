import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';
import { truncateAllTables } from '../../truncate_db';
import UserFactory from '../../../src/db/factory/user_factory';
import { User } from '../../../src/modules/user';
import { faker } from '@faker-js/faker';

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

describe('POST /api/auth/register', () => {
  it('give an error if invalid data provided', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'mohanned.kashpour',
      })
      .expect(422);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toMatchObject([
      {
        property: 'firstName',
      },
      {
        property: 'lastName',
      },
      {
        property: 'password',
      },
      {
        property: 'email',
      },
    ]);
  });

  it('can not register with already used email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Mohanned',
        lastName: 'Kashpour',
        email: user.email,
        password: '12345611',
      })
      .expect(422);
  });

  it('can register', async () => {
    const firstName = 'Mohanned',
      lastName = 'Kashpour';
    const email = faker.internet.exampleEmail({ firstName, lastName });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName,
        lastName,
        email,
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('token');

    expect(await knex('users').orderBy('id', 'desc').first()).toMatchObject({
      firstName,
      lastName,
      email,
    });
  });
});
