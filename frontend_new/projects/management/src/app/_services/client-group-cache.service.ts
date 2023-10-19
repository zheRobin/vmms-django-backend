import {inject, Injectable} from '@angular/core';
import {HelperService} from "vmms-common";
import {BehaviorSubject} from "rxjs";
import {DetailedClientGroup} from "../_interfaces/detailed-client-group";

@Injectable({
  providedIn: 'root'
})
export class ClientGroupCacheService {

  private helperService = inject(HelperService);

  private clientGroups$: BehaviorSubject<DetailedClientGroup[]> = new BehaviorSubject<DetailedClientGroup[]>([]);

  constructor() {}

  /* SCHEDULE CACHED DATA */
  getCachedClientGroups() {
    return this.clientGroups$.asObservable();
  }

  setCachedClientGroups(clientGroups: DetailedClientGroup[]) {
    this.clientGroups$.next(clientGroups);
  }

  addCachedClientGroup(clientGroup: DetailedClientGroup) {
    this.clientGroups$.next(this.helperService.sortByField([
      ...this.clientGroups$.getValue(),
      clientGroup
    ]));
  }

  updateCachedClientGroup(clientGroup: DetailedClientGroup) {
    this.clientGroups$.next(this.helperService.sortByField([
      ...this.clientGroups$.getValue().filter(cachedClientGroup => cachedClientGroup.id !== clientGroup.id),
      clientGroup
    ]));
  }

  removeCachedClientGroup(clientGroupId: number) {
    this.clientGroups$.next(
      this.clientGroups$.getValue().filter(cachedClientGroup => cachedClientGroup.id !== clientGroupId)
    );
  }

}
