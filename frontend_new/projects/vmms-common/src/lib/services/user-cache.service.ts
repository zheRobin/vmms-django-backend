import {inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import { User } from '../interfaces/user';
import {HelperService} from "./helper.service";

@Injectable({
  providedIn: 'root'
})
export class UserCacheService {

  private helperService = inject(HelperService);

  private users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor() { }

  getCachedUsers() {
    return this.users$.asObservable();
  }

  setCachedUsers(users: User[]) {
    this.users$.next(users);
  }

  addCachedUser(user: User) {
    this.users$.next(this.helperService.sortByField([
      ...this.users$.getValue(),
      user
    ], 'username'));
  }

  updateCachedUser(user: User) {
    this.users$.next(this.helperService.sortByField([
      ...this.users$.getValue().filter(cachedUser => cachedUser.id !== user.id),
      user
    ], 'username'));
  }

  removeCachedUser(userId: number) {
    this.users$.next(
      this.users$.getValue().filter(cachedUser => cachedUser.id !== userId)
    );
  }

}
