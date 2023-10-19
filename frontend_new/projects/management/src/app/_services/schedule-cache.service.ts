import {inject, Injectable} from '@angular/core';
import {HelperService} from "vmms-common";
import {BehaviorSubject} from "rxjs";
import {DetailedEvent} from "../_interfaces/detailed-event";

@Injectable({
  providedIn: 'root'
})
export class ScheduleCacheService {

  private helperService = inject(HelperService);

  private events$: BehaviorSubject<DetailedEvent[]> = new BehaviorSubject<DetailedEvent[]>([]);

  constructor() {}

  /* PREVIEW LINK CACHED DATA */
  getCachedEvents() {
    return this.events$.asObservable();
  }

  setCachedEvents(events: DetailedEvent[]) {
    this.events$.next(events);
  }

  addCachedEvent(event: DetailedEvent) {
    this.events$.next(this.helperService.sortByField([
      ...this.events$.getValue(),
      event
    ]));
  }

  updateCachedEvent(event: DetailedEvent) {
    this.events$.next(this.helperService.sortByField([
      ...this.events$.getValue().filter(cachedEvent => cachedEvent.id !== event.id),
      event
    ]));
  }

  removeCachedEvent(eventId: number) {
    this.events$.next(
      this.events$.getValue().filter(cachedEvent => cachedEvent.id !== eventId)
    );
  }

}
