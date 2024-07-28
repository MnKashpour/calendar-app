import * as types from './event_types';
import knex from '../../db/db';

const eventModel = () => knex<types.Event>('events');
const eventUserModel = () => knex<types.EventUser>('event_user');
const calendarEventModel = () => knex<{ calendarId: number; eventId: number }>('calendar_event');

class EventDAL {
  sensitiveFields: types.EventField[] = [];

  /**
   * Get paginated events that the user has access to
   */
  async listEventsForUserPaginated(
    userId: number,
    page: number,
    pageSize: number,
    search: string | null = null,
    filters: types.EventFilters | null = null,
    sort: 'createdAt' | 'start' | null = null,
    asc: boolean = true
  ) {
    const offset = (page - 1) * pageSize;

    const eventQuery = this.eventsOfUserQuery(userId);

    if (search) {
      eventQuery.whereILike('title', `%${search}%`);
    }

    if (filters?.from) {
      eventQuery.where('events.start', '>=', filters.from);
    }
    if (filters?.to) {
      eventQuery.where('events.end', '<=', filters.to);
    }
    if (filters?.eventOwner) {
      const onlyOwner = filters.eventOwner == 'me';
      eventQuery.where('event_user.role', onlyOwner ? '=' : '!=', 'owner');
    }

    const [totalCount] = await eventQuery.clone().count('* as total');

    if (sort) {
      eventQuery.orderBy(sort, asc ? 'asc' : 'desc');
    }

    const events = await eventQuery
      .limit(pageSize)
      .offset(offset)
      .select('events.*', 'event_user.role as user_role');

    return {
      data: events as types.Event[],
      totalCount: +totalCount.total,
    };
  }

  /**
   * Get event by id
   */
  async getEventById(id: number) {
    return await eventModel().where('id', id).first();
  }

  /**
   * Get event by id that a specific user has access to
   */
  async getEventByIdForUser(userId: number, id: number) {
    return await this.eventsOfUserQuery(userId)
      .where('id', id)
      .select('events.*', 'event_user.role as user_role')
      .first();
  }

  /**
   * Create a new event and register it with the userId
   */
  async createEventForUser(userId: number, calendarId: number, eventInput: types.EventInput) {
    let id: number | null = null;

    await knex.transaction(async () => {
      const [event] = await eventModel().insert(eventInput).returning('id');
      id = event.id;

      await eventUserModel().insert({
        eventId: event.id,
        userId: userId,
        role: 'owner',
        status: 'accepted',
      });

      await calendarEventModel().insert({
        calendarId: calendarId,
        eventId: event.id,
      });
    });

    return id;
  }

  /**
   * Get the user role in specific event
   */
  async getEventUser(userId: number, eventId: number) {
    return await eventUserModel().where('user_id', userId).where('event_id', eventId).first();
  }

  /**
   * Update event
   */
  async updateEvent(eventId: number, eventInput: Partial<types.EventInput>) {
    return await eventModel().where('id', eventId).update(eventInput);
  }

  /**
   * Delete event
   */
  async deleteEvent(id: number) {
    return await eventModel().where('id', id).delete();
  }

  /**
   * List all events starting in specific month that are registered with a calendarId
   */
  async getEventsOfCalendarInMonth(calendarId: number, year: number, month: number) {
    return await eventModel()
      .join('calendar_event', 'calendar_event.event_id', 'events.id')
      .where('calendar_event.calendar_id', calendarId)
      .whereRaw('EXTRACT(MONTH FROM events.start::date) = ?', [+month])
      .whereRaw('EXTRACT(YEAR FROM events.start::date) = ?', [+year])
      .select('events.*');
  }

  /**
   * Get all pending events
   */
  async listPendingEvents(userId: number) {
    return await eventModel()
      .join('event_user', 'event_user.event_id', 'events.id')
      .where('event_user.user_id', userId)
      .where('event_user.status', 'pending');
  }

  /**
   * Add event user
   */
  async addEventUser(data: types.EventUser) {
    return await eventUserModel().insert(data);
  }

  /**
   * Update event user data
   */
  async updateEventUser(eventId: number, userId: number, data: Partial<types.EventUser>) {
    return await eventUserModel()
      .where('event_user.user_id', userId)
      .where('event_user.event_id', eventId)
      .update(data);
  }

  /**
   * Delete event user
   */
  async deleteEventUser(eventId: number, userId: number) {
    await eventUserModel()
      .where('event_user.user_id', userId)
      .where('event_user.event_id', eventId)
      .delete();
  }

  /**
   * Register an event in a calendar
   */
  async addEventToCalendar(eventId: number, calendarId: number) {
    await calendarEventModel().insert({ calendarId, eventId });
  }

  /**
   * Remove an event from a calendar
   */
  async removeEventFromCalendar(eventId: number, calendarId: number) {
    await calendarEventModel().where('calendar_id', calendarId).where('event_id', eventId).delete();
  }

  // join of events and event_user
  private eventsOfUserQuery(userId: number, acceptedOnly: boolean = true) {
    let query = eventModel()
      .join('event_user', 'event_user.event_id', 'events.id')
      .where('event_user.user_id', userId);

    if (acceptedOnly) {
      query = query.where('event_user.status', 'accepted');
    }

    return query;
  }
}

export default new EventDAL();
