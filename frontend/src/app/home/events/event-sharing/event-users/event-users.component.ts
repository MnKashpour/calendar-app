import { Component, inject, Input } from '@angular/core';
import { EventUserInterface } from '../interfaces/event-user.interface';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiAlertService,
  TuiDataListModule,
  TuiLoaderModule,
  TuiNotificationT,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { EventSharingService } from '../services/event-sharing.service';
import { NetworkErrorHandlerService } from '../../../../shared/services/network-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EventInterface } from '../../interfaces/event.interface';

@Component({
  selector: 'app-event-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiSvgModule,
    TuiInputModule,
    TuiSelectModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
    TuiAutoFocusModule,
    TuiScrollbarModule,
    TuiLoaderModule,
    FormErrorComponent,
  ],
  templateUrl: './event-users.component.html',
  styleUrl: './event-users.component.css',
})
export class EventUsersComponent {
  @Input({ required: true }) event!: EventInterface;

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  eventSharingService = inject(EventSharingService);
  alerts = inject(TuiAlertService);
  networkErrorHandlerService = inject(NetworkErrorHandlerService);

  addUserForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer', Validators.required],
  });
  showAddUserForm: boolean = false;
  isLoading: boolean = false;

  users: EventUserInterface[] = [];

  ngOnInit() {
    this.fetchAllUsers();
  }

  notification(
    message: string,
    status: TuiNotificationT,
    autoClose: number = 1500
  ) {
    return this.alerts
      .open(message, {
        autoClose: autoClose,
        status: status,
      })
      .subscribe();
  }

  toggleShowAddUserForm() {
    this.showAddUserForm = !this.showAddUserForm;

    if (!this.showAddUserForm) {
      this.addUserForm.reset();
    }
  }

  fetchAllUsers() {
    this.isLoading = true;

    return this.eventSharingService.getEventUsers(this.event.id).subscribe({
      next: (res) => {
        this.isLoading = false;

        const authUser = this.authService.user();
        this.users = res.sort((a, b) => {
          if (a.id == authUser?.id) {
            return -2;
          }
          if (b.id == authUser?.id) {
            return 2;
          }

          if (a.firstName + ' ' + a.lastName < b.firstName + ' ' + b.lastName) {
            return -1;
          }

          if (a.firstName + ' ' + a.lastName > b.firstName + ' ' + b.lastName) {
            return 1;
          }

          return 0;
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.networkErrorHandlerService.handleError(error);
      },
    });
  }

  addUser() {
    if (!this.addUserForm!.valid) {
      this.addUserForm!.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.eventSharingService
      .addUserToEvent(this.event.id, this.addUserForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          this.fetchAllUsers();

          this.notification('User Invited Successfully', 'success');

          this.addUserForm.reset({
            role: 'viewer',
          });
        },
        error: (error) => {
          this.isLoading = false;

          if (error instanceof HttpErrorResponse && error.status == 404) {
            this.addUserForm.controls.email.setErrors({
              backend: 'Cannot find a user with this email',
            });
          }

          this.networkErrorHandlerService.handleError(error, this.addUserForm);
        },
      });
  }

  updateUserRole(userId: number, role: string) {
    this.isLoading = true;

    this.eventSharingService
      .updateUserRoleInEvent(this.event.id, userId, { role })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.fetchAllUsers();
          this.notification('Role Updated Successfully', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.networkErrorHandlerService.handleError(error);
        },
      });
  }

  deleteEventUser(userId: number) {
    this.isLoading = true;

    this.eventSharingService
      .deleteUserFromEvent(this.event.id, userId)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.fetchAllUsers();
          this.notification('User removed from event successfully', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.networkErrorHandlerService.handleError(error);
        },
      });
  }
}
