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

@Component({
  selector: 'app-all-day-events-dialog',
  standalone: true,
  imports: [CommonModule, TuiSvgModule],
  templateUrl: './all-day-events-dialog.component.html',
  styleUrl: './all-day-events-dialog.component.css',
})
export class AllDayEventsDialogComponent {
  context = inject(POLYMORPHEUS_CONTEXT) as TuiDialogContext<
    boolean,
    {
      day: Date;
      data: EventInterface[];
    }
  >;
  dialogService = inject(TuiDialogService);

  showEventDialog(eventId: number) {
    eventDialogObs(this.dialogService, {
      eventId,
    });
  }
}

export const allDayEventsDialogObs = (
  dialogService: TuiDialogService,
  data: {
    day: Date;
    data: EventInterface[];
  }
) =>
  dialogService.open<boolean>(
    new PolymorpheusComponent(AllDayEventsDialogComponent),
    {
      data: data,
      size: 's',
    }
  );
