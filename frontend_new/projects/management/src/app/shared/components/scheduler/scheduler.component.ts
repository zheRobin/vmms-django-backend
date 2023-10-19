import {Component, Output, EventEmitter, Input, OnInit, inject, LOCALE_ID, Inject} from '@angular/core';
import { Subject } from 'rxjs';
import {
  CalendarView,
  CalendarEvent
} from 'angular-calendar';
import {
  isSameDay,
  isSameMonth,
} from 'date-fns';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
})
export class SchedulerComponent implements OnInit {

  @Input() events: CalendarEvent[] = [];
  @Input() isLoading: boolean = false;
  @Output() selectedEventId: EventEmitter<number> = new EventEmitter<number>();
  @Output() currentDateInterval: EventEmitter<string[]> = new EventEmitter<string[]>();

  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = true;

  constructor() {
  }

  ngOnInit() {
    this.initiateDateInterval();
  }

  initiateDateInterval() {
    const date = new Date(this.viewDate);
    const day = date.getDay(),
      diff = date.getDate() - day + (day == 0 ? -6 : 0);
    this.currentDateInterval.emit([
      (new Date(date.setDate(diff))).toISOString().substring(0, 10),
      (new Date(date.setDate(diff + 6))).toISOString().substring(0, 10),
    ]);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) ||
        events.length === 0);
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.selectedEventId.emit(parseInt(event.id as string));
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.initiateDateInterval();
  }

}
