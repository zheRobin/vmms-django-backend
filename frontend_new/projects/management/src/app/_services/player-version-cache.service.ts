import {inject, Injectable} from '@angular/core';
import {HelperService} from "vmms-common";
import {BehaviorSubject} from "rxjs";
import {PlayerVersion} from "../_interfaces/player-version";

@Injectable({
  providedIn: 'root'
})
export class PlayerVersionCacheService {

  private helperService = inject(HelperService);

  private playerVersions$: BehaviorSubject<PlayerVersion[]> = new BehaviorSubject<PlayerVersion[]>([]);

  constructor() { }

  getCachedPlayerVersions() {
    return this.playerVersions$.asObservable();
  }

  setCachedPlayerVersions(versions: PlayerVersion[]) {
    this.playerVersions$.next(versions);
  }

  addCachedPlayerVersion(version: PlayerVersion) {
    this.playerVersions$.next(this.helperService.sortVersions([
      ...this.playerVersions$.getValue(),
      version
    ], 'version_string', 'desc'));
  }

  updateCachedPlayerVersion(version: PlayerVersion) {
    this.playerVersions$.next(this.helperService.sortVersions([
      ...this.playerVersions$.getValue().filter(cachedVersion => cachedVersion.id !== version.id),
      version
    ], 'version_string', 'desc'));
  }

}
