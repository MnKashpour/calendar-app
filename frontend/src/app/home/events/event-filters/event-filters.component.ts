import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  TuiSelectModule,
} from '@taiga-ui/kit';
import {
  TuiDataListModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {
  TuiContextWithImplicit,
  TuiDay,
  tuiPure,
  TuiStringHandler,
} from '@taiga-ui/cdk';

type FilterFormGroup = FormGroup<{
  search: FormControl<string | null>;
  sort: FormControl<string | null>;
  filters: FormGroup<{
    eventOwner: FormControl<string | null>;
    from: FormControl<TuiDay | null>;
    to: FormControl<TuiDay | null>;
  }>;
}>;

@Component({
  selector: 'app-event-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormErrorComponent,
    TuiInputModule,
    TuiSelectModule,
    TuiInputDateModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './event-filters.component.html',
  styleUrl: './event-filters.component.css',
})
export class EventFiltersComponent {
  @Input({ required: true }) formId: string = 'form-id';
  @Input({ required: true }) form!: FilterFormGroup;

  eventOwners = [
    { id: 'me', name: 'Me' },
    { id: 'others', name: 'Others' },
  ];

  sortBy = [
    { id: 'asc-start', name: 'Start Date ASC' },
    { id: 'desc-start', name: 'Start Date DESC' },
    { id: 'asc-createdAt', name: 'Creation Date ASC' },
    { id: 'desc-createdAt', name: 'Creation Date DESC' },
  ];

  @tuiPure
  stringify(
    items: readonly { id: string; name: string }[]
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(
      items.map(({ id, name }) => [id, name] as [string, string])
    );

    return ({ $implicit }: TuiContextWithImplicit<string>) =>
      map.get($implicit) || '';
  }
}

export const eventFiltersFormBuilder = (fb: FormBuilder): FilterFormGroup =>
  fb.group({
    search: [''],
    sort: ['asc-createdAt'],
    filters: fb.group({
      eventOwner: [null] as (string | Validators | null)[],
      from: [null] as (TuiDay | Validators | null)[],
      to: [null] as (TuiDay | Validators | null)[],
    }),
  });
