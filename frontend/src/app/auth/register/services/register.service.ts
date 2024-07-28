import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { RegisterData } from '../interfaces/register-data.interface';
import { AuthUserInterface } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.apiUrl;

  register(data: RegisterData) {
    return this.http.post<{ token: string; user: AuthUserInterface }>(
      `${this.baseApi}/auth/register`,
      data
    );
  }
}
