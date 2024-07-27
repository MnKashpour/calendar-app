import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  http = inject(HttpClient);
  baseApi = environment.apiUrl;

  logout() {
    return this.http.post(`${this.baseApi}/auth/logout`, {});
  }
}
