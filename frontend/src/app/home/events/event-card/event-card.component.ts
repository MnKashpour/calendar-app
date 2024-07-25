import { Component, Input } from '@angular/core';
import { EventInterface } from '../interfaces/event.interface';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TuiIslandModule } from '@taiga-ui/kit';
import { TuiSvgModule } from '@taiga-ui/core';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, TuiIslandModule, TuiSvgModule, TitleCasePipe],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css',
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventInterface;

  formatEventDateTime(): string {
    if (this.event.allDay) {
      if (this.event.start.getDate() == this.event.end.getDate()) {
        return this.getFormattedDate(this.event.start) + ' | ' + 'All Day';
      }

      return (
        this.getFormattedDate(this.event.start) +
        ' - ' +
        this.getFormattedDate(this.event.end) +
        ' | ' +
        'All Day'
      );
    }

    if (this.event.start.getDate() == this.event.end.getDate()) {
      return (
        this.getFormattedDate(this.event.start) +
        ' | ' +
        this.getFormattedTime(this.event.start) +
        ' - ' +
        this.getFormattedTime(this.event.end)
      );
    }

    return (
      this.getFormattedDate(this.event.start) +
      ' ' +
      this.getFormattedTime(this.event.start) +
      ' | ' +
      this.getFormattedDate(this.event.end) +
      ' ' +
      this.getFormattedTime(this.event.end)
    );
  }

  getFormattedDate(x: Date) {
    return (
      x.getFullYear() +
      '-' +
      (x.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      x.getDate().toString().padStart(2, '0')
    );
  }

  getFormattedTime(x: Date) {
    return (
      x.getHours().toString().padStart(2, '0') +
      ':' +
      x.getMinutes().toString().padStart(2, '0')
    );
  }
}
