import { Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiAlertService,
  TuiDialogContext,
  TuiDialogModule,
  TuiDialogService,
  TuiLoaderModule,
  TuiNotificationT,
} from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { EventsService } from '../services/events.service';
import { NetworkErrorHandlerService } from '../../../shared/services/network-error-handler.service';
import { CommonModule } from '@angular/common';
import {
  eventFormBuilder,
  EventFormComponent,
  updateEventFormValues,
} from '../event-form/event-form.component';
import {
  convertDateToTuiDay,
  convertDateToTuiTime,
  convertToDateTimeLocalString,
} from '../../../shared/helpers';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { EventInterface } from '../interfaces/event.interface';

type ReceivedDataType = {
  eventId?: number;
  initialData?: Partial<EventInterface>;
};

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EventFormComponent,
    TuiDialogModule,
    TuiLoaderModule,
  ],
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.css',
})
export class EventDialogComponent {
  fb = inject(FormBuilder);
  eventsService = inject(EventsService);
  networkErrorHandlerService = inject(NetworkErrorHandlerService);
  context = inject(POLYMORPHEUS_CONTEXT) as TuiDialogContext<
    boolean,
    ReceivedDataType | undefined
  >;
  alerts = inject(TuiAlertService);
  isLoading = false;

  eventId?: number = this.context.data?.eventId;
  initialData? = this.context.data?.initialData;

  form = eventFormBuilder(this.fb);

  ngOnInit() {
    if (this.eventId) {
      this.fetchData();
    } else if (this.initialData) {
      updateEventFormValues(this.form, this.initialData);
    }
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

  fetchData() {
    this.isLoading = true;
    return this.eventsService.getEventById(this.eventId!).subscribe({
      next: (res) => {
        this.isLoading = false;
        updateEventFormValues(this.form, res);
      },
      error: (error) => {
        this.isLoading = false;
        this.networkErrorHandlerService.handleError(error, this.form);
        this.context.completeWith(false);
      },
    });
  }

  createEvent(data: any) {
    this.isLoading = true;

    this.eventsService.createEvent(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.eventId = res.id;
        this.fetchData();

        this.notification('Event Created Successfully', 'success');

        this.context.completeWith(true);
      },
      error: (err) => {
        this.networkErrorHandlerService.handleError(err, this.form);
        this.isLoading = false;
      },
    });
  }

  updateEvent(data: any) {
    this.isLoading = true;

    this.eventsService.updateEvent(this.eventId!, data).subscribe({
      next: (response) => {
        this.isLoading = false;
        // this.fetchData();

        this.notification('Event Updated Successfully', 'success');

        this.context.completeWith(true);
      },
      error: (err) => {
        this.networkErrorHandlerService.handleError(err, this.form);
        this.isLoading = false;
      },
    });
  }

  deleteEvent() {
    //TODO confirm
    // if (!confirm('Are you sure you want to delete this event?')) return;

    this.isLoading = true;

    this.eventsService.deleteEvent(this.eventId!).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notification('Event Deleted Successfully', 'success');

        this.context.completeWith(true);
      },
      error: (err) => {
        this.networkErrorHandlerService.handleError(err, this.form);
        this.isLoading = false;
      },
    });
  }
}

// subscribe to show the dialog
export const eventDialogObs = (
  dialogService: TuiDialogService,
  data?: ReceivedDataType
) =>
  dialogService.open<boolean>(new PolymorpheusComponent(EventDialogComponent), {
    data: data,
  });
