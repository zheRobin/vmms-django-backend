import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HelperService} from "vmms-common";
import {ToastrService} from "ngx-toastr";
import {PlayerVersionCacheService} from "./player-version-cache.service";
import {map, Observable, switchMap, tap} from "rxjs";
import {PlayerVersion} from "../_interfaces/player-version";

@Injectable({
  providedIn: 'root'
})
export class PlayerVersionService {

  private httpClient = inject(HttpClient);
  private playerVersionCacheService = inject(PlayerVersionCacheService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllPlayerVersions(): Observable<PlayerVersion[]> {
    return this.httpClient.get<PlayerVersion[]>('/player-version/').pipe(
      map(versions => this.helperService.sortVersions(versions, 'version_string', 'desc')),
      tap(versions => this.playerVersionCacheService.setCachedPlayerVersions(versions)),
    );
  }

  getCurrentPlayerVersion(): Observable<PlayerVersion | null> {
    return this.playerVersionCacheService.getCachedPlayerVersions().pipe(
      map(versions => versions.find(version => version.current) || null)
    );
  }

  getPlayerVersion(id: number): Observable<PlayerVersion> {
    return this.playerVersionCacheService.getCachedPlayerVersions().pipe(
      map(versions => versions.find(version => version.id === id) as PlayerVersion)
    );
  }

  updatePlayerVersion(id: number) {
    return this.getPlayerVersion(id).pipe(
      map(version => {
        return { ...version, current: true }
      }),
      switchMap(version => {
        return this.httpClient.put<PlayerVersion>(`/player-version/${id}/`, version)
      }),
    );
  }

  uploadArtifact(file: File) {
    return this.httpClient.post<any>(`/s3/sign-upload-request/`, {
      file_name: file.name,
      file_type: file.type,
    }).pipe(
      tap((response: any) => this.httpClient.post<any>(response.data.url, {
        ...response.data.fields, file: file
      })),
      map((response: any) => response.url)
    );
  }

  // TODO: check if it works
  addPlayerVersion(newPlayerVersionForm: Partial<PlayerVersion>): Observable<PlayerVersion> {
    return this.httpClient.post<PlayerVersion>(`/player-version/`, newPlayerVersionForm).pipe(
      tap(version => this.playerVersionCacheService.addCachedPlayerVersion(version)),
      tap(() => this.toastrService.success('Player Version has been added'))
    );
  }

}
