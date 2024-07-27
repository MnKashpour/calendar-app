import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from './services/login.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import {
  TuiInputModule,
  TuiInputPasswordModule,
  TuiIslandModule,
} from '@taiga-ui/kit';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiLinkModule,
  TuiLoaderModule,
  TuiNotificationModule,
} from '@taiga-ui/core';
import { FormErrorFormatterPipe } from '../../shared/pipes/form-error-formatter.pipe';
import { NetworkErrorHandlerService } from '../../shared/services/network-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorFormatterPipe,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiLoaderModule,
    TuiLinkModule,
    TuiNotificationModule,
    TuiAutoFocusModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  loginService = inject(LoginService);
  authService = inject(AuthService);
  router = inject(Router);
  networkErrorHandler = inject(NetworkErrorHandlerService);
  alerts = inject(TuiAlertService);
  isLoading = false;
  isInvalidCred = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isInvalidCred = false;
    this.isLoading = true;

    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.setLoginState(response.user, response.token);
        this.router.navigateByUrl('');

        const welcomeMsgs = [
          'Nice to see you',
          'Welcome back',
          'Good moring/evening',
          'We missed you, Welcome',
        ];
        this.alerts
          .open(
            welcomeMsgs[Math.floor(Math.random() * welcomeMsgs.length)] +
              ' ' +
              this.authService.user()?.firstName,
            {
              autoClose: 1500,
              status: 'success',
            }
          )
          .subscribe();
      },
      error: (err) => {
        this.networkErrorHandler.handleError(err, this.loginForm);
        this.isLoading = false;

        if (
          err instanceof HttpErrorResponse &&
          err.error.code === 'INVALID_CRED'
        ) {
          this.isInvalidCred = true;
        }
      },
    });
  }
}
