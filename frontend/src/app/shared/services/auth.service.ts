import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthUserInterface } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type AuthState = 'signedIn' | 'signedOut' | 'unknown';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    try {
      this.setState(user ? JSON.parse(user) : null, token);
    } catch (error) {
      this.setLogoutState();
    }

    if (this.signedIn()) {
      setTimeout(() => this.updateMe());
    }
  }

  http = inject(HttpClient);

  baseUrl = environment.apiUrl;

  private token$ = signal<string | undefined | null>(undefined);
  token = computed(() => this.token$());

  private user$ = signal<AuthUserInterface | undefined | null>(undefined);
  user = computed(() => this.user$());

  authState = computed<AuthState>(() => {
    if (this.user$() && this.token$()) return 'signedIn';
    if (this.user$() === null || this.token$() === null) return 'signedOut';
    return 'unknown';
  });

  signedIn = computed(() => this.authState() === 'signedIn');
  signedOut = computed(() => this.authState() === 'signedOut');

  setState(user: AuthUserInterface | null, token: string | null) {
    if (user && token) {
      this.setLoginState(user, token);
    } else {
      this.setLogoutState();
    }
  }

  setLoginState(user: AuthUserInterface, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user$.set(user);
    this.token$.set(token);
  }

  setLogoutState() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user$.set(null);
    this.token$.set(null);
  }

  updateMe() {
    this.http
      .get<AuthUserInterface>(`${this.baseUrl}/users/me`)
      .subscribe((user) => this.user$.set(user));
  }
}
