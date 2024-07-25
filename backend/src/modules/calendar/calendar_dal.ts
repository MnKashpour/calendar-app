import * as types from './calendar_types';
import knex from '../../db/db';

const calendarModel = () => knex<types.Calendar>('calendars');
const calendarUserModel = () => knex<types.CalendarUser>('calendar_user');
const calendarEventModel = () => knex<{ calendarId: number; eventId: number }>('calendar_event');

class CalendarDAL {
  sensitiveFields: types.CalendarField[] = [];

  /**
   * Get calendars that the user has access to
   */
  async listCalendarsForUser(userId: number) {
    const calendars = await this.calendarsOfUserQuery(userId).select(
      'calendars.*',
      'calendar_user.role as user_role'
    );

    return calendars;
  }

  /**
   * Get calendar by id
   */
  async getCalendarById(id: number) {
    return await calendarModel().where('id', id).first();
  }

  /**
   * Get calendar that the user has access to by id
   */
  async getCalendarByIdForUser(userId: number, calendarId: number) {
    return await this.calendarsOfUserQuery(userId).where('id', calendarId).first();
  }

  /**
   * Create calendar and register it with the userId
   */
  async createCalendarForUser(userId: number, calendarInput: types.CalendarInput) {
    let id: number | null = null;

    await knex.transaction(async () => {
      const [calendar] = await calendarModel().insert(calendarInput).returning('id');
      id = calendar.id;

      await calendarUserModel().insert({
        calendarId: calendar.id,
        userId: userId,
        role: 'owner',
        status: 'accepted',
      });
    });

    return id;
  }

  /**
   * Get role of the user in the this calendar
   */
  async getUserRoleOfCalendar(userId: number, calendarId: number): Promise<string | null> {
    const results: any = await calendarUserModel()
      .select('role')
      .where('user_id', userId)
      .where('calendar_id', calendarId)
      .where('status', 'accepted');

    if (results.length == 0) {
      return null;
    }

    return results[0].role;
  }

  /**
   * Update calendar
   */
  async updateCalendar(calendarId: number, calendarInput: Partial<types.CalendarInput>) {
    return await calendarModel().where('id', calendarId).update(calendarInput);
  }

  /**
   * Delete calendar
   */
  async deleteCalendar(id: number) {
    return await calendarModel().where('id', id).delete();
  }

  /**
   * Get number of calendars that the user has access to with role
   */
  async accessibleCalendarsCount(userId: number, role: types.CalendarUserRole[] = ['owner']) {
    const [record] = await this.calendarsOfUserQuery(userId)
      .whereIn('calendar_user.role', role)
      .count('* as total');

    return +record.total;
  }

  /**
   * Get default calendarId for the user
   */
  async getDefaultCalendarIdForUser(userId: number) {
    const record = await calendarUserModel()
      .where('user_id', userId)
      .where('role', 'owner')
      .first();

    return record?.calendarId;
  }

  // join of calendars and calendar_user
  private calendarsOfUserQuery(userId: number, acceptedOnly: boolean = true) {
    let query = calendarModel()
      .join('calendar_user', 'calendar_user.calendar_id', 'calendars.id')
      .where('calendar_user.user_id', userId);

    if (acceptedOnly) {
      query = query.where('calendar_user.status', 'accepted');
    }

    return query;
  }
}

export default new CalendarDAL();
