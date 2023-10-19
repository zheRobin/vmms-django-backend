import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ClientGroupCacheService} from "./client-group-cache.service";
import {DetailedClientGroup} from "../_interfaces/detailed-client-group";
import {map, Observable, switchMap, tap} from "rxjs";
import {HelperService} from "vmms-common";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class ClientGroupService {

  private httpClient = inject(HttpClient);
  private clientGroupCacheService = inject(ClientGroupCacheService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllClientGroups(): Observable<DetailedClientGroup[]> {
    return this.httpClient.get<DetailedClientGroup[]>('/client-group/').pipe(
      map(groups => this.helperService.sortByField(groups)),
      tap(groups => this.clientGroupCacheService.setCachedClientGroups(groups)),
      switchMap(() => this.clientGroupCacheService.getCachedClientGroups())
    );
  }

  getClientGroup(id: number): Observable<DetailedClientGroup> {
    return this.httpClient.get<DetailedClientGroup>(`/client-group/${id}/`);
  }

  createClientGroup(newClientGroupForm: Partial<DetailedClientGroup>): Observable<DetailedClientGroup> {
    return this.httpClient.post<DetailedClientGroup>('/client-group/', newClientGroupForm).pipe(
      tap(group => this.clientGroupCacheService.addCachedClientGroup(group)),
      tap(() => this.toastrService.success('Client Group has been created'))
    );
  }

  updateClientGroup(newClientGroupForm: Partial<DetailedClientGroup>, id: number): Observable<DetailedClientGroup> {
    return this.httpClient.put<DetailedClientGroup>(`/client-group/${id}/`, newClientGroupForm).pipe(
      tap(group => this.clientGroupCacheService.updateCachedClientGroup(group)),
      tap(() => this.toastrService.success('Client Group has been updated'))
    );
  }

  deleteClientGroup(id: number): Observable<any> {
    return this.httpClient.delete<any>(`/client-group/${id}/`).pipe(
      tap(() => this.clientGroupCacheService.removeCachedClientGroup(id)),
      tap(() => this.toastrService.success('Client Group has been deleted'))
    );
  }

}
