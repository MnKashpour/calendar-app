import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import knex from '../../../src/db/db';
import app from '../../../src/app';
import { AuthService } from '../../../src/modules/auth';
import { truncateAllTables } from '../../truncate_db';
import UserFactory from '../../../src/db/factory/user_factory';
import EventFactory from '../../../src/db/factory/event_factory';
import { User } from '../../../src/modules/user';
import { Calendar } from '../../../src/modules/calendar';
import { Event } from '../../../src/modules/event';

beforeAll(async () => {
  await truncateAllTables(knex);
  await setup();
});
afterAll(async () => {
  knex.destroy();
});

let authUser: User;
let token: string;
let calendar: Calendar;
let event: Event;

async function setup() {
  [{ user: authUser, calendar }] = await new UserFactory().make(knex);
  [event] = await new EventFactory().make(knex, authUser);

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /api/calendars', () => {
  it('can get calendars', async () => {
    await request(app)
      .get(`/api/calendars`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /api/calendars/:id', () => {
  it('can get calendar by id', async () => {
    await request(app)
      .get(`/api/calendars/${calendar.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /api/calendars/:id/events', () => {
  it('can get all events in a month of calendar by id', async () => {
    const res = await request(app)
      .get(`/api/calendars/${calendar.id}/events`)
      .query({
        year: 2024,
        month: 7,
      })
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
