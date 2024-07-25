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
let calendar;
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

  [calendar] = await knex('calendars')
    .insert({
      name: 'Calendar',
    })
    .returning('*');

  await knex('calendar_user').insert({
    calendarId: calendar.id,
    userId: authUser.id,
    role: 'owner',
    status: 'accepted',
  });

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

  await knex('calendar_event').insert({
    calendarId: calendar.id,
    userId: authUser.id,
  });

  token = await AuthService.getJwtToken(authUser.id);
}

describe('GET /calendars', () => {
  it('can get calendars', async () => {
    await request(app)
      .get(`/calendars`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /calendars/:id', () => {
  it('can get calendar by id', async () => {
    await request(app)
      .get(`/calendars/${calendar.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /calendars/:id/events', () => {
  it('can get all events in a month of calendar by id', async () => {
    await request(app)
      .get(`/calendars/${calendar.id}/events`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
