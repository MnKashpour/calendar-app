import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { EventsComponent } from './home/events/events.component';
import { CalendarComponent } from './home/calendar/calendar.component';
import { AuthService } from './shared/services/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: 'calendars/:id', component: CalendarComponent },
      { path: 'events', component: EventsComponent },
      {
        path: '**',
        redirectTo: (_) => {
          const authService = inject(AuthService);
          if (!authService.user()) {
            return '/auth/login';
          }

          return `calendars/${authService.user()?.id}`;
        },
      },
    ],
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];
