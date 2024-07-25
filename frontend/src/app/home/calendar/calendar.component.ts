import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CalendarService } from './services/calendar.service';
import {
  catchError,
  combineLatest,
  debounceTime,
  finalize,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { CalendarInterface } from './interfaces/calendar.interface';
import { EventInterface } from '../events/interfaces/event.interface';
import { NetworkErrorHandlerService } from '../../shared/services/network-error-handler.service';
import {
  TuiDialogService,
  TuiLoaderModule,
  TuiSvgModule,
} from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { eventDialogObs } from '../events/event-dialog/event-dialog.component';
import { TuiDataListWrapperModule, TuiSelectModule } from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { allDayEventsDialogObs } from '../events/all-day-events-dialog/all-day-events-dialog.component';

type CalendarDayType = {
  active: boolean;
  isToday: boolean;
  day: number;
  month: number;
  year: number;
  events: EventInterface[];
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    TuiSvgModule,
    TuiLoaderModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  calendarId!: number;

  SHOWN_EVENT_PER_CELL = 3;

  route = inject(ActivatedRoute);
  calendarService = inject(CalendarService);
  networkErrorHandlerService = inject(NetworkErrorHandlerService);
  dialogService = inject(TuiDialogService);
  changeDetectorRef = inject(ChangeDetectorRef);
  isLoading = false;

  currentDate = new Date();
  calendarDays = this.generateCalendar();
  data?: { calendar: CalendarInterface; events: EventInterface[] };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.calendarId = +params.get('id')!;
      this.fetchData();
    });
  }

  fetchData() {
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();

    return this.calendarService
      .getEventsOfCalendarInMonth(
        this.calendarId,
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1
      )
      .subscribe({
        next: (res) => {
          this.data = res;
          this.isLoading = false;

          this.injectEventsIntoCalenderDays(
            this.data.events,
            this.calendarDays
          );

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.networkErrorHandlerService.handleError(error);
        },
      });
  }

  showAllEventsInADayDialog(day: CalendarDayType, data: EventInterface[]) {
    return allDayEventsDialogObs(this.dialogService, {
      day: new Date(day.year, day.month - 1, day.day),
      data,
    }).subscribe();
  }

  showEventDialog(eventId?: number, calendarDay?: CalendarDayType) {
    const now = new Date();
    const initialDate = calendarDay
      ? new Date(
          calendarDay?.year,
          calendarDay?.month - 1,
          calendarDay?.day,
          now.getHours(),
          now.getMinutes()
        )
      : undefined;

    eventDialogObs(this.dialogService, {
      eventId,
      initialData: {
        start: initialDate,
        end: initialDate,
      },
    }).subscribe((operationDone) => {
      if (operationDone) {
        this.fetchData();
      }
    });
  }

  changeMonth(monthChange: 1 | -1) {
    this.changeDate(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + monthChange,
      this.currentDate.getDate()
    );
  }

  goToToday() {
    const today = new Date();
    this.changeDate(today.getFullYear(), today.getMonth(), today.getDate());
  }

  changeDate(year: number, month: number, day: number) {
    this.currentDate = new Date(year, month, day);
    this.calendarDays = this.generateCalendar();
    this.fetchData();
  }

  reduceEvents(events: EventInterface[]): EventInterface[] {
    if (events.length >= this.SHOWN_EVENT_PER_CELL) {
      return events.slice(0, this.SHOWN_EVENT_PER_CELL);
    }

    return events;
  }

  //=====================================================

  injectEventsIntoCalenderDays(
    events: EventInterface[] | null,
    calendarDays: CalendarDayType[],
    clearOldEvents: boolean = true
  ) {
    if (clearOldEvents) {
      for (const calendarDay of calendarDays) {
        calendarDay.events = [];
      }
    }

    if (!events) return;

    for (const calendarDay of calendarDays) {
      calendarDay.events = events
        .filter((event) => {
          const match =
            event.start.getFullYear() == calendarDay.year &&
            event.start.getMonth() + 1 == calendarDay.month &&
            event.start.getDate() == calendarDay.day;
          return match;
        })
        .sort((a, b) => {
          if (a.start > b.start) return 1;
          if (a.start < b.start) return -1;
          return 0;
        });
    }
  }

  generateCalendar(): CalendarDayType[] {
    const today = new Date();

    const month = this.currentDate.getMonth();
    const year = this.currentDate.getFullYear();

    const prevMonthDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month + 1, 1);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfMonth = new Date(year, month, lastDateOfMonth).getDay();
    const lastDateOfLastMonth = new Date(year, month, 0).getDate();

    const calendar: CalendarDayType[] = [];

    // previous month last days
    for (let i = firstDayOfMonth; i > 0; i--) {
      calendar.push({
        active: false,
        isToday: false,
        day: lastDateOfLastMonth - i + 1,
        month: prevMonthDate.getMonth() + 1,
        year: prevMonthDate.getFullYear(),
        events: [],
      });
    }

    // this month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      let isToday =
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      calendar.push({
        active: true,
        isToday: isToday,
        day: i,
        month: month + 1,
        year: year,
        events: [],
      });
    }

    // next month first days (inactive)
    for (let i = lastDayOfMonth; i < 6; i++) {
      calendar.push({
        active: false,
        isToday: false,
        day: i - lastDayOfMonth + 1,
        month: nextMonthDate.getMonth() + 1,
        year: nextMonthDate.getFullYear(),
        events: [],
      });
    }

    return calendar;
  }
}
