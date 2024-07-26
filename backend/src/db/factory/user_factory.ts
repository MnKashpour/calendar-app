import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../modules/auth';
import { User } from '../../modules/user';
import { Calendar, CalendarUser } from '../../modules/calendar';
import Factory from './factory';

type ReturnType = { user: User; calendar: Calendar };

export default class UserFactory implements Factory<ReturnType> {
  async define(knex: Knex) {
    let firstName = faker.person.firstName(),
      lastName = faker.person.lastName();
    const [user] = await knex<User>('users')
      .insert({
        firstName: firstName,
        lastName: lastName,
        email: faker.internet.exampleEmail({ firstName, lastName }),
        password: await AuthService.hashPassword('123456'),
        status: 'active',
      })
      .returning('*');

    const [calendar] = await knex<Calendar>('calendars')
      .insert({
        name: 'Main Calendar ' + user.id,
      })
      .returning('*');

    await knex<CalendarUser>('calendar_user').insert({
      calendarId: calendar.id,
      userId: user.id,
      role: 'owner',
      status: 'accepted',
    });

    return { user, calendar };
  }

  async make(knex: Knex, count: number = 1) {
    const returnArr: ReturnType[] = [];

    for (let counter = 0; counter < count; counter++) {
      returnArr.push(await this.define(knex));
    }

    return returnArr;
  }
}
