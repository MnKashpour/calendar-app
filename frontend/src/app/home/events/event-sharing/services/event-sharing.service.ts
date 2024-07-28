import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { EventUserInterface } from '../interfaces/event-user.interface';

@Injectable({
  providedIn: 'root',
})
export class EventSharingService {
  http = inject(HttpClient);
  baseApi = environment.apiUrl;

  getEventUsers(eventId: number) {
    return this.http.get<EventUserInterface[]>(
      `${this.baseApi}/events/${eventId}/users`
    );
  }

  addUserToEvent(eventId: number, data: { email: string; role: string }) {
    return this.http.post(`${this.baseApi}/events/${eventId}/users`, data);
  }

  updateUserRoleInEvent(
    eventId: number,
    userId: number,
    data: { role: string }
  ) {
    return this.http.put(
      `${this.baseApi}/events/${eventId}/users/${userId}`,
      data
    );
  }

  deleteUserFromEvent(eventId: number, userId: number) {
    return this.http.delete(
      `${this.baseApi}/events/${eventId}/users/${userId}`
    );
  }
}
