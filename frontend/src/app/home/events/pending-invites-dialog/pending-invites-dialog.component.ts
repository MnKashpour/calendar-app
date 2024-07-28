import { Component, inject } from '@angular/core';
import {
  TuiDialogContext,
  TuiDialogService,
  TuiSvgModule,
} from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { EventInterface } from '../interfaces/event.interface';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { eventDialogObs } from '../event-dialog/event-dialog.component';
import { CommonModule } from '@angular/common';
import { EventsService } from '../services/events.service';
import { NetworkErrorHandlerService } from '../../../shared/services/network-error-handler.service';

@Component({
  selector: 'app-pending-invites-dialog',
  standalone: true,
  imports: [CommonModule, TuiSvgModule],
  templateUrl: './pending-invites-dialog.component.html',
  styleUrl: './pending-invites-dialog.component.css',
})
export class PendingInvitesDialogComponent {
  context = inject(POLYMORPHEUS_CONTEXT) as TuiDialogContext<
    boolean,
    EventInterface[]
  >;

  dialogService = inject(TuiDialogService);
  eventsService = inject(EventsService);
  networkErrorHandlerService = inject(NetworkErrorHandlerService);

  isLoading: boolean = false;
  events = this.context.data;

  fetchData() {
    this.isLoading = true;

    return this.eventsService.getPendingInvites().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.events = res;
      },
      error: (error) => {
        this.isLoading = false;
        this.networkErrorHandlerService.handleError(error);
      },
    });
  }

  showEventDialog(eventId: number) {
    eventDialogObs(this.dialogService, {
      eventId,
    }).subscribe({
      next: () => {
        this.context.$implicit.next(true);
        this.fetchData();
      },
    });
  }
}

export const pendingInvitesDialogObs = (
  dialogService: TuiDialogService,
  data: EventInterface[]
) =>
  dialogService.open<boolean>(
    new PolymorpheusComponent(PendingInvitesDialogComponent),
    {
      data: data,
      size: 'm',
    }
  );
