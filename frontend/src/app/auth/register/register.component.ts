import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from './services/register.service';
import { CommonModule } from '@angular/common';
import { FormErrorFormatterPipe } from '../../shared/pipes/form-error-formatter.pipe';
import {
  TuiCheckboxLabeledModule,
  TuiInputDateModule,
  TuiInputModule,
  TuiInputPasswordModule,
  TuiIslandModule,
  TuiMarkerIconModule,
} from '@taiga-ui/kit';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiLinkModule,
  TuiLoaderModule,
} from '@taiga-ui/core';
import { NetworkErrorHandlerService } from '../../shared/services/network-error-handler.service';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorFormatterPipe,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiLinkModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiMarkerIconModule,
    TuiLoaderModule,
    TuiAutoFocusModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  registerService = inject(RegisterService);
  authService = inject(AuthService);
  router = inject(Router);
  networkErrorHandler = inject(NetworkErrorHandlerService);
  alerts = inject(TuiAlertService);
  isLoading = false;

  registerForm = this.fb.nonNullable.group({
    firstName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.max(30)],
    ],
    lastName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.max(30)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    this.registerService.register(this.registerForm.getRawValue()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.setLoginState(response.user, response.token);
        this.router.navigateByUrl('');

        this.alerts
          .open('Welcome aboard, ' + this.authService.user()?.firstName, {
            autoClose: 1500,
            status: 'success',
          })
          .subscribe();
      },
      error: (err) => {
        this.networkErrorHandler.handleError(err, this.registerForm);
        this.isLoading = false;
      },
    });
  }
}
