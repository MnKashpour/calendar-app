import { HttpParams } from '@angular/common/http';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';

export const setQueryString = (
  params: { [key: string]: any },
  keyPrefix: string = '',
  keySuffix: string = '',
  httpParams?: HttpParams
): HttpParams => {
  httpParams ??= new HttpParams();

  for (const key of Object.keys(params)) {
    if (!params[key]) continue;

    let value = params[key];

    if (Object.prototype.toString.call(value) === '[object Object]') {
      httpParams = setQueryString(value, `${key}[`, ']', httpParams);
      continue;
    }

    if (value instanceof Date) {
      value = value.toISOString();
    }

    httpParams = httpParams.set(keyPrefix + key + keySuffix, value);
  }

  return httpParams;
};

export const convertToDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const convertDateToTuiDay = (date: Date): TuiDay => {
  return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
};
export const convertDateToTuiTime = (date: Date): TuiTime => {
  return new TuiTime(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

export const convertTuiDateTimeToDate = (
  tuiDay: TuiDay,
  tuiTime?: TuiTime
): Date => {
  const date = tuiDay.toLocalNativeDate();

  if (tuiTime) {
    date.setHours(tuiTime.hours);
    date.setMinutes(tuiTime.minutes);
    date.setSeconds(tuiTime.seconds);
    date.setMilliseconds(tuiTime.ms);
  }

  return date;
};

export const formGroupRequiredValidator =
  (requiredFields: string[]): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    let isValid = true;

    for (const fieldName of requiredFields) {
      const field = control.get(fieldName);

      if (
        !field ||
        field.value === null ||
        field.value === undefined ||
        field.value === ''
      ) {
        isValid = false;
        break;
      }
    }

    return isValid ? null : { required: true };
  };
