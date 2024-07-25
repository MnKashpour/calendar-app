import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import {
  TuiInputDateModule,
  TuiInputModule,
  TuiInputTimeModule,
  TuiSelectModule,
  TuiTextareaModule,
  TuiToggleModule,
} from '@taiga-ui/kit';
import {
  TuiDataListModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import {
  convertDateToTuiDay,
  convertDateToTuiTime,
  convertTuiDateTimeToDate,
  formGroupRequiredValidator,
} from '../../../shared/helpers';
import {
  combineLatest,
  debounceTime,
  startWith,
  Subscription,
  tap,
} from 'rxjs';
import { eventColors, eventIcons } from '../../../constants';
import { EventInterface } from '../interfaces/event.interface';

type EventFormGroup = FormGroup<{
  title: FormControl<string>;
  location: FormControl<string | null>;
  allDay: FormControl<boolean>;
  start: FormGroup<{
    startDate: FormControl<TuiDay | null>;
    startTime: FormControl<TuiTime | null>;
  }>;
  end: FormGroup<{
    endDate: FormControl<TuiDay | null>;
    endTime: FormControl<TuiTime | null>;
  }>;
  color: FormControl<string>;
  icon: FormControl<string>;
  note: FormControl<string | null>;
}>;

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormErrorComponent,
    TuiInputModule,
    TuiSelectModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
    TuiToggleModule,
    TuiInputDateModule,
    TuiInputTimeModule,
    TuiSvgModule,
    TuiTextareaModule,
  ],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css',
})
export class EventFormComponent {
  @Input({ required: true }) formId: string = 'form-id';
  @Input({ required: true }) form!: EventFormGroup;
  @Output() submitEvent = new EventEmitter<any>();

  colors = eventColors;
  icons = eventIcons;

  allDaySub!: Subscription;
  hideTime = false;

  ngOnInit() {
    const startForm = this.form.controls.start;
    const endForm = this.form.controls.end;

    this.allDaySub = this.form.controls.allDay.valueChanges.subscribe(
      (isAllDay) => {
        if (isAllDay) {
          this.hideTime = true;
          startForm.controls.startTime.setValue(new TuiTime(0, 0, 0, 0));
          endForm.controls.endTime.setValue(new TuiTime(23, 59, 59, 999));
        } else {
          this.hideTime = false;
          startForm.controls.startTime.setValue(null);
          endForm.controls.endTime.setValue(null);
        }
      }
    );
  }

  ngOnDestroy() {
    this.allDaySub.unsubscribe();
  }

  onSubmit() {
    if (!this.form!.valid) {
      this.form!.markAllAsTouched();
      return;
    }

    this.submitEvent.emit(this.formatBody(this.form!.value));
  }

  formatBody(data: any) {
    if (data.start) {
      data.start = convertTuiDateTimeToDate(
        data.start.startDate,
        data.start.startTime
      ).toISOString();
    }
    if (data.end) {
      data.end = convertTuiDateTimeToDate(
        data.end.endDate,
        data.end.endTime
      ).toISOString();
    }

    return data;
  }
}

export const eventFormBuilder = (fb: FormBuilder): EventFormGroup =>
  fb.nonNullable.group({
    title: ['', Validators.required],
    location: ['' as string | null],
    allDay: [false, Validators.required],
    start: fb.group(
      {
        startDate: [TuiDay.currentLocal(), Validators.required] as (
          | TuiDay
          | Validators
          | null
        )[],
        startTime: [TuiTime.currentLocal(), Validators.required] as (
          | TuiTime
          | Validators
          | null
        )[],
      },
      {
        validators: formGroupRequiredValidator(['startDate', 'startTime']),
      }
    ),
    end: fb.group(
      {
        endDate: [TuiDay.currentLocal(), Validators.required] as (
          | TuiDay
          | Validators
          | null
        )[],
        endTime: [TuiTime.currentLocal(), Validators.required] as (
          | TuiTime
          | Validators
          | null
        )[],
      },
      {
        validators: formGroupRequiredValidator(['endDate', 'endTime']),
      }
    ),
    color: [
      eventColors[Math.floor(Math.random() * eventColors.length)],
      Validators.required,
    ],
    icon: [
      eventIcons[Math.floor(Math.random() * eventIcons.length)],
      Validators.required,
    ],
    note: ['' as string | null],
  });

export const updateEventFormValues = (
  form: EventFormGroup,
  value: Partial<EventInterface>
) =>
  form.setValue({
    title: value.title ?? '',
    location: value.location ?? null,
    allDay: value.allDay ?? false,
    start: {
      startDate: value.start ? convertDateToTuiDay(value.start) : null,
      startTime: value.start ? convertDateToTuiTime(value.start) : null,
    },
    end: {
      endDate: value.end ? convertDateToTuiDay(value.end) : null,
      endTime: value.end ? convertDateToTuiTime(value.end) : null,
    },
    color:
      value.color ??
      eventColors[Math.floor(Math.random() * eventColors.length)],
    icon:
      value.icon ?? eventIcons[Math.floor(Math.random() * eventIcons.length)],
    note: value.note ?? null,
  });
