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
let event;

async function setup() {
  [authUser] = await knex('users')
    .insert({
      first_name: 'first',
      last_name: 'last',
      email: 'mohanned.kashpour@gmail.com',
      password: await AuthService.hashPassword('123456'),
      status: 'active',
    })
    .returning('*');

  [event] = await knex('events')
    .insert({
      title: 'event title',
      location: 'location',
      allDay: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      color: 'red',
      icon: 'tuiIconShoppingCart',
      note: 'Note',
    })
    .returning('*');

  await knex('event_user').insert({
    eventId: event.id,
    userId: authUser.id,
    role: 'owner',
    status: 'accepted',
  });

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /events', () => {
  it('can get events paginated', async () => {
    await request(app)
      .get(`/events`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /events/:id', () => {
  it('can get event by id', async () => {
    await request(app)
      .get(`/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('POST /events', () => {
  it('can create event', async () => {
    await request(app)
      .post(`/events`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        title: 'event title',
        location: 'location',
        allDay: false,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        color: 'red',
        icon: 'tuiIconShoppingCart',
        note: 'Note',
      })
      .expect(201);
  });
});

describe('PUT /events/:id', () => {
  it('can update event', async () => {
    await request(app)
      .put(`/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        title: 'event title',
        location: 'location',
        allDay: false,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        color: 'red',
        icon: 'tuiIconShoppingCart',
        note: 'Note',
      })
      .expect(200);
  });
});

describe('DELETE /events/:id', () => {
  it('can delete event', async () => {
    await request(app)
      .delete(`/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
