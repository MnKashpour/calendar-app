import InvalidDataError from '../../utils/errors/invalid_data_error';
import NotFoundError from '../../utils/errors/not_found_error';
import { omitSensitiveFields, PaginatedData } from '../../utils/helper';
import { eventService } from '../event';
import { Event } from '../event/event_types';
import CalendarDAL from './calendar_dal';
import * as types from './calendar_types';

class CalendarService {
  /**
   * Get calendars that the user has access to
   */
  async getAllCalendarsForUser(userId: number): Promise<Partial<types.Calendar>[]> {
    const calendars = await CalendarDAL.listCalendarsForUser(userId);

    return calendars.map((ele) => omitSensitiveFields(ele, CalendarDAL.sensitiveFields));
  }

  /**
   * Get calendar that the user has access to by id
   */
  async getCalendarByIdForUser(userId: number, calendarId: number) {
    const calendar = await CalendarDAL.getCalendarByIdForUser(userId, calendarId);

    if (!calendar) {
      throw new NotFoundError('Calendar Not Found');
    }

    return omitSensitiveFields(calendar, CalendarDAL.sensitiveFields);
  }

  /**
   * Create new calendar
   */
  async createCalendarForUser(userId: number, calendarInput: types.CalendarInput) {
    const calendarId = await CalendarDAL.createCalendarForUser(userId, calendarInput);

    return calendarId;
  }

  /**
   * Check if the user has a specific role in the calendar
   */
  async userHasCalendarRole(userId: number, calendarId: number, roles: types.CalendarUserRole[]) {
    const role = (await CalendarDAL.getUserRoleOfCalendar(
      userId,
      calendarId
    )) as types.CalendarUserRole;

    return role && roles.includes(role);
  }

  /**
   * Update calendar
   */
  async updateCalendar(calendarId: number, calendarInput: Partial<types.CalendarInput>) {
    const exists = !!(await CalendarDAL.getCalendarById(calendarId));

    if (!exists) {
      throw new NotFoundError('Calendar Not Found');
    }

    await CalendarDAL.updateCalendar(calendarId, calendarInput);
  }

  /**
   * Delete calendar
   */
  async deleteCalendar(userId: number, calendarId: number) {
    const calendarsCount = await CalendarDAL.accessibleCalendarsCount(userId, ['owner']);

    if (calendarsCount <= 1) {
      throw new InvalidDataError('Cannot delete last owned calendar for user', []);
    }

    const exists = !!(await CalendarDAL.getCalendarById(calendarId));

    if (!exists) {
      throw new NotFoundError('Calendar Not Found');
    }

    await CalendarDAL.deleteCalendar(calendarId);
  }

  /**
   * List all events starting in specific month that are registered with a calendarId that the user has access to
   */
  async getAllMonthEventsInCalendarForUser(
    userId: number,
    calendarId: number,
    input: types.CalendarEventMonthFilter
  ): Promise<{ calendar: Partial<types.Calendar>; events: Partial<Event>[] }> {
    const calendar = await this.getCalendarByIdForUser(userId, calendarId);

    const events = await eventService.getEventsOfCalendarInMonth(
      calendarId,
      input.year,
      input.month
    );

    return {
      calendar,
      events,
    };
  }

  /**
   * Get Default calendarId for the user, he should be the owner of this calendar
   */
  async getDefaultCalendarIdForUser(userId: number) {
    return await CalendarDAL.getDefaultCalendarIdForUser(userId);
  }
}

export default new CalendarService();
