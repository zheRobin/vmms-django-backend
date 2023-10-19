import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ClientService} from "../../../../_services/client.service";
import {ScheduleService} from "../../../../_services/schedule.service";
import {Observable, shareReplay, switchMap, tap} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DetailedClient} from "../../../../_interfaces/detailed-client";
import {GlobalService, ListItem} from "vmms-common";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-schedule-editor',
  templateUrl: './schedule-editor.component.html',
  styleUrls: ['./schedule-editor.component.scss']
})
export class ScheduleEditorComponent implements OnInit, OnDestroy {

  private clientService = inject(ClientService);
  private scheduleService = inject(ScheduleService);
  private globalService = inject(GlobalService);
  private activatedRoute = inject(ActivatedRoute);

  isEditorOpened: boolean = false;
  isLoading: boolean = false;

  clientId!: number;
  client$!: Observable<DetailedClient | null>;
  events$!: Observable<any>;
  currentEventId!: number | null;
  currentDateInterval: string[] = [];

  contentControl!: FormControl;
  programList$!: Observable<ListItem[]>;

  ngOnInit() {
    this.client$ = this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.clientId = parseInt(paramMap.get('clientId') || '');
        this.globalService.setCurrentItem({id: this.clientId, category: 'client'});
        this.setEvents([]);
        return this.clientService.getClient(this.clientId).pipe(shareReplay());
      }),
      tap(res => {
        this.programList$ = this.clientService.getProgramList().pipe(shareReplay());

        this.contentControl = new FormControl(res?.basic_content.object);
      })
    );
  }

  ngOnDestroy() {
    if (this.clientId) {
      this.globalService.removeCurrentItem();
    }
  }

  setEvents(event: string[]) {
    this.isLoading = true;

    if (event.length) {
      this.currentDateInterval = [...event];
    }

    this.events$ = this.scheduleService.getScheduleByTime(
      this.clientId,
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

  save(client: DetailedClient) {
    this.clientService.updateClient({
      ...client,
      basic_content: {
        id: `pr${this.contentControl?.value?.id}`,
        object: this.contentControl?.value,
        type: 'program',
      }
    }, client.id).pipe(
      tap(() => this.setEvents([]))
    ).subscribe();
  }

  open() {
    this.isEditorOpened = true;
  }

  close() {
    this.isEditorOpened = false;
    this.currentEventId = null;
  }

}
