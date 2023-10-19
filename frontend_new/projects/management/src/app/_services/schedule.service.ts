import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable, tap} from "rxjs";
import {DetailedEvent} from "../_interfaces/detailed-event";
import {ToastrService} from "ngx-toastr";
import {ScheduleCacheService} from "./schedule-cache.service";
import {CalendarEvent} from "angular-calendar";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private httpClient = inject(HttpClient);
  private scheduleCacheService = inject(ScheduleCacheService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getScheduleByTime(id: number, category: 'client' | 'client-group', timeInterval: string) {
    return this.httpClient.get(`/${category}/${id}/schedule/${timeInterval}`).pipe(
      map(res => this.formatEvent(res))
    );
  }

  getEvent(id: number, category: 'event' | 'group-event'): Observable<DetailedEvent> {
    return this.httpClient.get<DetailedEvent>(`/${category}/${id}/`);
  }

  createEvent(category: 'event' | 'group-event', event: Partial<DetailedEvent>) {
    return this.httpClient.post<DetailedEvent>(`/${category}/`, event).pipe(
      tap(event => this.scheduleCacheService.addCachedEvent(event)),
      tap(() => this.toastrService.success('Event has been created'))
    );
  }

  updateEvent(id: number, category: 'event' | 'group-event', event: Partial<DetailedEvent>) {
    return this.httpClient.put<DetailedEvent>(`/${category}/${id}/`, event).pipe(
      tap(event => this.scheduleCacheService.updateCachedEvent(event)),
      tap(() => this.toastrService.success('Event has been updated'))
    );
  }

  deleteEvent(id: number, category: 'event' | 'group-event') {
    return this.httpClient.delete<void>(`/${category}/${id}/`).pipe(
      tap(() => this.scheduleCacheService.removeCachedEvent(id)),
      tap(() => this.toastrService.success('Event has been deleted'))
    );
  }

  formatEvent(event: any) {
    return Object.entries(event.event_dates).map(([key, value]) => {
      const currentEvent = event.events.find((item: any) => item.id === parseInt(key))?.content.object;
      return (value as any[]).map((eventDate: any) => {
        return {
          id: key,
          start: new Date(new Date(eventDate.start).toUTCString().substring(0, 25)),
          end: new Date(new Date(eventDate.end).toUTCString().substring(0, 25)),
          title: `${eventDate.start.slice(11, 16)} - ${eventDate.end.slice(11, 16)}: \n${currentEvent.prefix} ${currentEvent.name}`,
          color: {primary: currentEvent.color, secondary: currentEvent.color},
          isClickable: true,
          isDisabled: false,
        } as CalendarEvent;
      })
    }).flat();
  }

}
