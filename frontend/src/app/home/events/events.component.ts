import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EventsService } from './services/events.service';
import { CommonModule } from '@angular/common';
import { EventInterface } from './interfaces/event.interface';
import {
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { TuiPaginationModule } from '@taiga-ui/kit';
import { DataOrError } from '../../shared/interfaces/data-or-error.interface';
import { NetworkErrorHandlerService } from '../../shared/services/network-error-handler.service';
import {
  EventFiltersInterface,
  EventSortInterface,
} from './interfaces/event-filters.interface';
import {
  EventDialogComponent,
  eventDialogObs,
} from './event-dialog/event-dialog.component';
import {
  TuiButtonModule,
  TuiDialogService,
  TuiSvgModule,
} from '@taiga-ui/core';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { EventCardComponent } from './event-card/event-card.component';
import {
  EventFiltersComponent,
  eventFiltersFormBuilder,
} from './event-filters/event-filters.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EventFiltersComponent,
    EventDialogComponent,
    FormErrorComponent,
    EventCardComponent,
    TuiPaginationModule,
    TuiButtonModule,
    TuiSvgModule,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  fb = inject(FormBuilder);
  eventsService = inject(EventsService);
  networkErrorHandlerService = inject(NetworkErrorHandlerService);
  changeDetectorRef = inject(ChangeDetectorRef);
  dialogService = inject(TuiDialogService);
  isLoading = false;
  isError = false;

  currentPage = 1;
  pageSize: number = 12;
  totalItems: number = 1;
  totalPages: number = 1;

  _refetchSub = new Subject<void>();
  refetch$ = this._refetchSub.asObservable();

  form = eventFiltersFormBuilder(this.fb);

  data$: Observable<EventInterface[]> = combineLatest([
    this.form.valueChanges.pipe(
      startWith({}),
      debounceTime(300),
      tap(() => this.pageChange(1))
    ),
    this.refetch$.pipe(startWith(null)),
  ]).pipe(switchMap((_, __) => this.fetchData()));

  pageChange(page: number) {
    this.currentPage = page;
    this._refetchSub.next();
  }

  fetchData() {
    this.isLoading = true;
    this.isError = false;
    this.changeDetectorRef.detectChanges();

    const { search, sort, filters } = this.form.getRawValue();

    return this.eventsService
      .index(
        this.currentPage,
        this.pageSize,
        search,
        this.formatSort(sort),
        this.formatFilters(filters)
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;

          this.currentPage = res.currentPage;
          this.pageSize = res.pageSize;
          this.totalItems = res.totalCount;
          this.totalPages = res.totalPages;
        }),
        map((res) => res.data),
        catchError((error, _) => {
          this.isLoading = false;
          this.isError = true;

          this.currentPage = 1;
          this.totalItems = 0;
          this.totalPages = 1;

          this.networkErrorHandlerService.handleError(error, this.form);

          return of([]);
        }),
        finalize(() => this.changeDetectorRef.detectChanges())
      );
  }

  formatSort(sort: string | null) {
    if (!sort) return null;

    const sortFields = sort.split('-');
    return {
      sorting: sortFields[0],
      field: sortFields[1],
    } as EventSortInterface;
  }

  formatFilters(filters: any) {
    if (!filters) return null;

    filters.from = filters.from
      ? new Date(
          filters.from.year.toString().padStart(2, '0') +
            '-' +
            (filters.from.month + 1).toString().padStart(2, '0') +
            '-' +
            filters.from.day.toString().padStart(2, '0') +
            'T00:00:00Z'
        )
      : null;
    filters.to = filters.to
      ? new Date(
          filters.to.year.toString().padStart(2, '0') +
            '-' +
            (filters.to.month + 1).toString().padStart(2, '0') +
            '-' +
            filters.to.day.toString().padStart(2, '0') +
            'T23:59:59Z'
        )
      : null;

    filters.eventOwner = filters.eventOwner
      ? (filters.eventOwner as 'me' | 'others')
      : null;

    return filters as EventFiltersInterface;
  }

  showEventDialog(eventId?: number) {
    eventDialogObs(this.dialogService, { eventId }).subscribe(
      (operationDone) => {
        if (operationDone) {
          this._refetchSub.next();
        }
      }
    );
  }
}
