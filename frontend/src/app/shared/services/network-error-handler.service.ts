import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkErrorHandlerService {
  constructor() {}

  private alerts = inject(TuiAlertService);

  handleError(err: any, formGroup?: FormGroup) {
    let message = '';

    if (err instanceof HttpErrorResponse) {
      if (err.status >= 500) {
        message = 'Server Error, Please try again later!';
      }

      if (err.status == 422) {
        message = err.error.message ?? 'Provided data is invalid!';
      }

      if (err.status == 404) {
        message = 'Cannot find the requested resource!';
      }

      if (err.status == 403) {
        message = 'You are not authorized to perform this action!';
      }

      if (err.status == 400) {
        message = err.error.message ?? null;
      }

      if (err.status == 0 && err.error.isTrusted) {
        message = 'Connection error, Please check your internet!';
      }

      if (!message && err.status >= 400 && err.status < 500) {
        message = 'Your request is invalid';
      }
    }

    if (!message) {
      message = 'Error occured, Please try again later';
    }

    const alertSub = this.alerts
      .open(message, {
        autoClose: 3000,
        status: 'error',
      })
      .subscribe({});

    if (formGroup) {
      this.showFormErrors(err, formGroup);
    }

    return alertSub;
  }

  showFormErrors(err: any, formGroup: FormGroup) {
    if (!(err instanceof HttpErrorResponse) || err.status != 422) {
      return;
    }

    const validationErrors = err.error.errors ?? null;

    if (!validationErrors || !(validationErrors instanceof Array)) {
      return;
    }

    for (const error of validationErrors) {
      let control: AbstractControl = formGroup;

      for (const path of error.property.split('.')) {
        control = (control as FormGroup).controls[path];
      }

      control.setErrors({ backend: error.message });
      control.markAsTouched();
    }
  }
}
