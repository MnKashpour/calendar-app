import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  http = inject(HttpClient);
  baseApi = environment.baseUrl;

  logout() {
    return this.http.post(`${this.baseApi}/auth/logout`, {});
  }
}
