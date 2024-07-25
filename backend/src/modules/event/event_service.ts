import NotFoundError from '../../utils/errors/not_found_error';
import { omitSensitiveFields, PaginatedData } from '../../utils/helper';
import { calendarService } from '../calendar';
import EventDAL from './event_dal';
import * as types from './event_types';

class EventService {
  /**
   * Get paginated events that the user has access to
   */
  async getAllEventPaginatedForUser(
    userId: number,
    params: types.GetEventQueryParams
  ): Promise<PaginatedData<Partial<types.Event>>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 15;

    const paginatedEvents = await EventDAL.listEventsForUserPaginated(
      userId,
      page,
      pageSize,
      params.search,
      params.filters,
      params.sort?.field,
      (params.sort?.sorting ?? 'asc') == 'asc'
    );

    return {
      totalCount: paginatedEvents.totalCount,
      data: paginatedEvents.data.map((ele) => omitSensitiveFields(ele, EventDAL.sensitiveFields)),
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(paginatedEvents.totalCount / pageSize),
    };
  }

  /**
   * Get event that the user has access to by id
   */
  async getEventByIdForUser(userId: number, eventId: number) {
    const event = await EventDAL.getEventByIdForUser(userId, eventId);

    if (!event) {
      throw new NotFoundError('Event Not Found');
    }

    return omitSensitiveFields(event, EventDAL.sensitiveFields);
  }

  /**
   * Create new event
   */
  async createEventForUser(userId: number, eventInput: types.EventInput) {
    const userCalendarId = await calendarService.getDefaultCalendarIdForUser(userId);

    const eventId = await EventDAL.createEventForUser(userId, userCalendarId!, eventInput);

    return eventId;
  }

  /**
   * Check if the user has a specific role in the event
   */
  async userHasEventRole(userId: number, eventId: number, roles: types.EventUserRole[]) {
    const role = await EventDAL.getUserRoleOfEvent(userId, eventId);

    return role && roles.includes(role);
  }

  /**
   * Update event
   */
  async updateEvent(eventId: number, eventInput: Partial<types.EventInput>) {
    const exists = !!(await EventDAL.getEventById(eventId));

    if (!exists) {
      throw new NotFoundError('Event Not Found');
    }

    await EventDAL.updateEvent(eventId, eventInput);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: number) {
    const exists = !!(await EventDAL.getEventById(eventId));

    if (!exists) {
      throw new NotFoundError('Event Not Found');
    }

    await EventDAL.deleteEvent(eventId);
  }

  /**
   * List all events starting in specific month that are registered with a calendarId
   */
  async getEventsOfCalendarInMonth(calendarId: number, year: number, month: number) {
    return (await EventDAL.getEventsOfCalendarInMonth(calendarId, year, month)).map((ele) =>
      omitSensitiveFields(ele, EventDAL.sensitiveFields)
    );
  }
}

export default new EventService();
