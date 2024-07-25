import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { LoginData } from '../interfaces/login-data.interface';
import { UserInterface } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.baseUrl;

  login(data: LoginData) {
    return this.http.post<{ token: string; user: UserInterface }>(
      `${this.baseApi}/auth/login`,
      data
    );
  }
}
