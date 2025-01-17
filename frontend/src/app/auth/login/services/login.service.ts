import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LoginData } from '../interfaces/login-data.interface';
import { AuthUserInterface } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.apiUrl;

  login(data: LoginData) {
    return this.http.post<{ token: string; user: AuthUserInterface }>(
      `${this.baseApi}/auth/login`,
      data
    );
  }
}
