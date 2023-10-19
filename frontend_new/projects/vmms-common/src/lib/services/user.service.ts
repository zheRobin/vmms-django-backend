import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {combineLatest, map, Observable, switchMap, tap} from "rxjs";
import {HelperService} from "./helper.service";
import {UserCacheService} from "./user-cache.service";
import {User} from "../interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private httpClient = inject(HttpClient);
  private userCacheService = inject(UserCacheService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<any>('/user/').pipe(
      map(users => this.helperService.sortByField(users, 'username')),
      tap(users => this.userCacheService.setCachedUsers(users)),
    );
  }

  getUserData(): Observable<User[]> {
    return combineLatest([this.getAllUsers()]).pipe(
      switchMap(() => this.userCacheService.getCachedUsers())
    );
  }

  getUser(id: number): Observable<User> {
    return this.httpClient.get<any>(`/user/${id}/`);
  }

  createUser(newUserForm: any): Observable<User> {
    return this.httpClient.post<any>('/user/', newUserForm).pipe(
      tap(user => this.userCacheService.addCachedUser(user)),
      tap(() => this.toastrService.success('User has been created'))
    );
  }

  updateUser(newUserForm: any, id: number): Observable<User> {
    return this.httpClient.put<any>(`/user/${id}/`, newUserForm).pipe(
      tap(user => this.userCacheService.updateCachedUser(user)),
      tap(() => this.toastrService.success('User has been updated'))
    );
  }

  deleteUser(id: number) {
    return this.httpClient.delete<any>(`/user/${id}/`).pipe(
      tap(() => this.userCacheService.removeCachedUser(id)),
      tap(() => this.toastrService.success('User has been deleted'))
    );
  }

}
