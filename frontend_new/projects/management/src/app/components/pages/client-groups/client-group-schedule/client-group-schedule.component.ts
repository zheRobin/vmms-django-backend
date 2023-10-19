import {Component, inject} from '@angular/core';
import {Observable, shareReplay, switchMap, tap} from "rxjs";
import {ClientGroupService} from "../../../../_services/client-group.service";
import {ScheduleService} from "../../../../_services/schedule.service";
import {GlobalService} from "vmms-common";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DetailedClientGroup} from "../../../../_interfaces/detailed-client-group";

@Component({
  selector: 'app-client-group-schedule',
  templateUrl: './client-group-schedule.component.html',
  styleUrls: ['./client-group-schedule.component.scss']
})
export class ClientGroupScheduleComponent {

  private clientGroupService = inject(ClientGroupService);
  private scheduleService = inject(ScheduleService);
  private globalService = inject(GlobalService);
  private activatedRoute = inject(ActivatedRoute);

  isEditorOpened: boolean = false;
  isLoading: boolean = false;

  groupId!: number;
  group$!: Observable<DetailedClientGroup>;
  events$!: Observable<any>;
  currentEventId!: number | null;
  currentDateInterval: string[] = []

  ngOnInit() {
    this.group$ = this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.groupId = parseInt(paramMap.get('id') || '');
        this.globalService.setCurrentItem({id: this.groupId, category: 'client-group'});
        this.setEvents([]);
        return this.clientGroupService.getClientGroup(this.groupId).pipe(shareReplay());
      }),
    );
  }

  ngOnDestroy() {
    if (this.groupId) {
      this.globalService.removeCurrentItem();
    }
  }

  setEvents(event: string[]) {
    this.isLoading = true;

    if (event.length) {
      this.currentDateInterval = [...event];
    }

    this.events$ = this.scheduleService.getScheduleByTime(
      this.groupId,
      'client-group',
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

}
