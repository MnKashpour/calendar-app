import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Paginated } from '../../../shared/interfaces/paginated.interface';
import { EventInterface } from '../interfaces/event.interface';
import { setQueryString } from '../../../shared/helpers';
import {
  EventFiltersInterface,
  EventSortInterface,
} from '../interfaces/event-filters.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.apiUrl;

  index(
    page?: number,
    pageSize?: number,
    search?: string | null,
    sort?: EventSortInterface | null,
    filters?: EventFiltersInterface | null
  ) {
    return this.http
      .get<Paginated<EventInterface>>(`${this.baseApi}/events`, {
        params: setQueryString({
          page,
          pageSize,
          search,
          filters,
          sort,
        }),
      })
      .pipe(map((res) => ({ ...res, data: res.data.map(this.eventMapper()) })));
  }

  createEvent(data: Omit<EventInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.http.post<{ id: number }>(`${this.baseApi}/events`, data);
  }

  getEventById(id: number) {
    return this.http
      .get<EventInterface>(`${this.baseApi}/events/${id}`)
      .pipe(map(this.eventMapper()));
  }

  updateEvent(
    id: number,
    data: Omit<EventInterface, 'id' | 'createdAt' | 'updatedAt' | 'userRole'>
  ) {
    return this.http.put<{ id: number }>(`${this.baseApi}/events/${id}`, data);
  }

  deleteEvent(id: number) {
    return this.http.delete(`${this.baseApi}/events/${id}`);
  }

  getPendingInvites() {
    return this.http
      .get<EventInterface[]>(`${this.baseApi}/events/invites/pending`, {})
      .pipe(map((res) => res.map(this.eventMapper())));
  }

  acceptEventInvite(id: number) {
    return this.http.put(`${this.baseApi}/events/${id}/invites/accept`, {});
  }

  deleteMeFromEvent(id: number) {
    return this.http.delete(`${this.baseApi}/events/${id}/invite`);
  }

  private eventMapper() {
    return (event: EventInterface) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    });
  }
}
