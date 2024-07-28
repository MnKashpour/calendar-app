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
import { Calendar } from '../../../src/modules/calendar';
import { afterEach, beforeEach } from 'node:test';

beforeAll(async () => {
  await truncateAllTables(knex);
  await setup();
});
afterAll(async () => {
  knex.destroy();
});

let authUser: User;
let authUserCalendar: Calendar;
let user: User;
let userCalendar: Calendar;
let token: string;

async function setup() {
  const [u1, u2] = await new UserFactory().make(knex, 2);

  authUser = u1.user;
  authUserCalendar = u1.calendar;
  user = u2.user;
  userCalendar = u2.calendar;

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
    const [event] = await new EventFactory().make(knex, authUser);

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
    const [event] = await new EventFactory().make(knex, authUser);

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
    const [event] = await new EventFactory().make(knex, authUser);

    await request(app)
      .delete(`/api/events/${event.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

//=================================================================
//=================================================================
//=================================================================
describe('GET /api/events/invites/pending', () => {
  it('can get pending invites', async () => {
    await request(app)
      .get(`/api/events/invites/pending`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('PUT /api/events/:id/invites/accept', () => {
  it('can accept pending invite', async () => {
    const [event] = await new EventFactory().make(knex, user, 1);

    await knex('event_user').insert({
      userId: authUser.id,
      eventId: event.id,
      role: 'viewer',
      status: 'pending',
    });

    await request(app)
      .put(`/api/events/${event.id}/invites/accept`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('DELETE /api/events/:id/invite', () => {
  it('can delete invite', async () => {
    const [event] = await new EventFactory().make(knex, user, 1);

    await knex('event_user').insert({
      userId: authUser.id,
      eventId: event.id,
      role: 'viewer',
      status: 'accepted',
    });

    await knex('calendar_event').insert({
      calendarId: authUserCalendar.id,
      eventId: event.id,
    });

    await request(app)
      .delete(`/api/events/${event.id}/invite`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('GET /api/events/:id/users', () => {
  it('can get all users in event', async () => {
    const [event] = await new EventFactory().make(knex, authUser, 1);

    await knex('event_user').insert({
      userId: user.id,
      eventId: event.id,
      role: 'viewer',
      status: 'accepted',
    });

    await request(app)
      .get(`/api/events/${event.id}/users`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});

describe('POST /api/events/:id/users', () => {
  it('can add user to event', async () => {
    const [event] = await new EventFactory().make(knex, authUser, 1);

    await request(app)
      .post(`/api/events/${event.id}/users`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        email: user.email,
        role: 'viewer',
      })
      .expect(200);
  });
});

describe('PUT /api/events/:id/users/:userId', () => {
  it('can update user role in event', async () => {
    const [event] = await new EventFactory().make(knex, authUser, 1);

    await knex('event_user').insert({
      userId: user.id,
      eventId: event.id,
      role: 'writer',
      status: 'accepted',
    });

    await request(app)
      .put(`/api/events/${event.id}/users/${user.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        role: 'viewer',
      })
      .expect(200);
  });
});

describe('DELETE /api/events/:id/users/:userId', () => {
  it('can delete user from event', async () => {
    const [event] = await new EventFactory().make(knex, authUser, 1);

    await knex('event_user').insert({
      userId: user.id,
      eventId: event.id,
      role: 'writer',
      status: 'accepted',
    });
    await knex('calendar_event').insert({
      calendarId: userCalendar.id,
      eventId: event.id,
    });

    await request(app)
      .delete(`/api/events/${event.id}/users/${user.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
