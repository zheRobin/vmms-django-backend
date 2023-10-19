import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ClientService} from "../../../_services/client.service";
import {Observable, shareReplay, tap} from "rxjs";
import {FileSystem} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";
import {ScheduleService} from "../../../_services/schedule.service";
import {GlobalService} from "vmms-common";

@Component({
  selector: 'app-master-schedules',
  templateUrl: './master-schedules.component.html',
  styleUrls: ['./master-schedules.component.scss']
})
export class MasterSchedulesComponent implements OnInit, OnDestroy {

  private clientService = inject(ClientService);
  private scheduleService = inject(ScheduleService);
  private globalService = inject(GlobalService);

  isEditorOpened: boolean = false;
  isLoading: boolean = false;

  currentFileSystem$!: Observable<FileSystem>;
  events$!: Observable<any>;
  currentEventId!: number | null;
  currentDateInterval: string[] = []
  searchControl: FormControl = new FormControl('');

  ngOnInit() {
    this.currentFileSystem$ = this.clientService.getClientFileSystem().pipe(shareReplay());
  }

  ngOnDestroy() {
    this.globalService.removeCurrentItem();
  }

  setEvents(event: string[]) {
    this.isLoading = true;

    if (event.length) {
      this.currentDateInterval = [...event];
    }

    this.events$ = this.scheduleService.getScheduleByTime(
      -1,
      'client',
      `?schedule_end=${this.currentDateInterval[1]}&schedule_start=${this.currentDateInterval[0]}`
    ).pipe(
      tap(() => this.isLoading = false)
    );
  }

  selectEvent(eventId: number) {
    this.currentEventId = eventId;
    this.isEditorOpened = true;
  }

  open() {
    this.isEditorOpened = true;
  }

  close() {
    this.isEditorOpened = false;
    this.currentEventId = null;
  }

  enableAll(value: boolean) {
    this.clientService.enableMasterSchedule(value).subscribe();
  }

}
