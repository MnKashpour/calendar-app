import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { CalendarInterface } from '../interfaces/calendar.interface';
import { EventInterface } from '../../events/interfaces/event.interface';
import { setQueryString } from '../../../shared/helpers';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.baseUrl;

  getEventsOfCalendarInMonth(calendarId: number, year: number, month: number) {
    return this.http
      .get<{
        calendar: CalendarInterface;
        events: EventInterface[];
      }>(`${this.baseApi}/calendars/${calendarId}/events`, {
        params: setQueryString({
          year,
          month,
        }),
      })
      .pipe(
        map((res) => ({
          ...res,
          events: res.events.map((event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          })),
        }))
      );
  }

  index() {
    return this.http.get<CalendarInterface>(`${this.baseApi}/calendars`);
  }

  createCalendar(
    data: Omit<CalendarInterface, 'id' | 'createdAt' | 'updatedAt' | 'userRole'>
  ) {
    return this.http.post<{ id: number }>(`${this.baseApi}/calendars`, data);
  }

  getCalendarById(id: number) {
    return this.http.get<CalendarInterface>(`${this.baseApi}/calendars/${id}`);
  }

  updateCalendar(
    id: number,
    data: Omit<CalendarInterface, 'id' | 'createdAt' | 'updatedAt' | 'userRole'>
  ) {
    return this.http.put<{ id: number }>(
      `${this.baseApi}/calendars/${id}`,
      data
    );
  }

  deleteCalendar(id: number) {
    return this.http.delete<{ id: number }>(`${this.baseApi}/calendars/${id}`);
  }
}
