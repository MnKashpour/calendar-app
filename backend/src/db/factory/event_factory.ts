import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../modules/auth';
import { User } from '../../modules/user';
import { Calendar, CalendarUser } from '../../modules/calendar';
import Factory from './factory';
import { Event } from '../../modules/event';

export default class EventFactory implements Factory<Event> {
  async define(knex: Knex, user: User) {
    const { calendarId } = await knex('calendar_user').where('userId', user.id).first();

    const startDate = faker.date.soon();
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 3);

    const [event] = await knex<Event>('events')
      .insert({
        title: faker.word.words({ count: { min: 2, max: 5 } }),
        location:
          faker.location.street() + ', ' + faker.location.city() + ', ' + faker.location.country(),
        allDay: Math.random() >= 0.5,
        start: startDate,
        end: endDate,
        color: 'red',
        icon: 'tuiIconShoppingCart',
        note: faker.word.words({ count: { min: 5, max: 30 } }),
      })
      .returning('*');

    await knex('event_user').insert({
      eventId: event.id,
      userId: user.id,
      role: 'owner',
      status: 'accepted',
    });

    await knex('calendar_event').insert({
      calendarId: calendarId,
      eventId: event.id,
    });

    return event;
  }

  async make(knex: Knex, user: User, count: number = 1) {
    const returnArr: Event[] = [];

    for (let counter = 0; counter < count; counter++) {
      returnArr.push(await this.define(knex, user));
    }

    return returnArr;
  }
}
