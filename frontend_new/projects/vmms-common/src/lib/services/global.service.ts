import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../interfaces/user";
import {Folder, Program} from "../interfaces/file-system";

export interface SelectedItem {
  id: number;
  category: 'folder' | 'playlist' | 'program' | 'user' | 'client' | 'client-group' | 'player-version' | 'schedule';
}

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  currentUser$: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
  currentItem$: BehaviorSubject<SelectedItem | null> = new BehaviorSubject<SelectedItem | null>(null);

  openedFolder$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {}

  setCurrentUser(user: User) {
    this.currentUser$.next(user);
  }

  getCurrentUser(): Observable<User> {
    return this.currentUser$.asObservable();
  }

  setCurrentItem(item: SelectedItem) {
    return this.currentItem$.next(item);
  }

  getCurrentItem() {
    return this.currentItem$.asObservable();
  }

  getCurrentItemValue() {
    return this.currentItem$.getValue();
  }

  removeCurrentItem() {
    this.removeOpenedFolder();
    return this.currentItem$.next(null);
  }

  setOpenedFolder(folder: any) {
    this.openedFolder$.next(folder);
  }

  getOpenedFolder(): Observable<any> {
    return this.openedFolder$.asObservable();
  }

  getOpenedFolderValue() {
    return this.openedFolder$.getValue();
  }

  isEqual(folder: Folder | Program) {
    const currentlyOpenedFolder = this.getOpenedFolderValue();
    return currentlyOpenedFolder?.id === folder.id;
  }

  removeOpenedFolder() {
    return this.openedFolder$.next(null);
  }

}
