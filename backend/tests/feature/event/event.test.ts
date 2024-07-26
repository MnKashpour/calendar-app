import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import EventFactory from '../../../src/db/factory/event_factory';
import UserFactory from '../../../src/db/factory/user_factory';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';
import { truncateAllTables } from '../../truncate_db';
import { User } from '../../../src/modules/user';
import { Event } from '../../../src/modules/event';

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
let event: Event;

async function setup() {
  [{ user: authUser }] = await new UserFactory().make(knex);
  [event] = await new EventFactory().make(knex, authUser);

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /api/events', () => {
  it('can get events paginated', async () => {
    await request(app)
      .get(`/api/events`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /api/events/:id', () => {
  it('can get event by id', async () => {
    await request(app)
      .get(`/api/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('POST /api/events', () => {
  it('can create event', async () => {
    await request(app)
      .post(`/api/events`)
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

describe('PUT /api/events/:id', () => {
  it('can update event', async () => {
    await request(app)
      .put(`/api/events/${event.id}`)
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

describe('DELETE /api/events/:id', () => {
  it('can delete event', async () => {
    await request(app)
      .delete(`/api/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
