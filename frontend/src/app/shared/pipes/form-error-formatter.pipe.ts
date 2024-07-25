import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ErrorMessage, errorMessages } from './error-messages-data';

@Pipe({
  name: 'formErrorFormatter',
  standalone: true,
})
export class FormErrorFormatterPipe implements PipeTransform {
  transform(value: ValidationErrors | null): string {
    if (!value) {
      return '';
    }

    const errorType = Object.keys(value)[0] ?? null;

    if (!errorType) return '';

    if (
      value[errorType] instanceof Object &&
      value[errorType]?.hasOwnProperty('errorMessage')
    ) {
      return value[errorType].errorMessage;
    }

    if (errorType == 'backend') {
      return value[errorType];
    }

    if (errorType == 'required' || errorType == 'email')
      return errorMessages(errorType);

    if (errorType == 'minlength' || errorType == 'maxlength')
      return errorMessages(errorType, {
        length: value[errorType]['requiredLength'] ?? null,
      });

    return 'This field is invalid';
  }
}
