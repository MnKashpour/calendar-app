import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { RegisterData } from '../interfaces/register-data.interface';
import { UserInterface } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor() {}

  http = inject(HttpClient);
  baseApi = environment.baseUrl;

  register(data: RegisterData) {
    return this.http.post<{ token: string; user: UserInterface }>(
      `${this.baseApi}/auth/register`,
      data
    );
  }
}
