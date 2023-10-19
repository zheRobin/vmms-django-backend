import {inject, Injectable} from '@angular/core';
import {HelperService, GlobalService} from "vmms-common";
import {BehaviorSubject} from "rxjs";
import {Client, Folder} from "../_interfaces/file-system";
import {DetailedClient} from "../_interfaces/detailed-client";

@Injectable({
  providedIn: 'root'
})
export class ClientCacheService {

  private helperService = inject(HelperService);
  private globalService = inject(GlobalService);

  private clients$: BehaviorSubject<(Client | DetailedClient)[]> = new BehaviorSubject<(Client | DetailedClient)[]>([]);
  private folders$: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  constructor() {}

  /* CLIENT CACHED DATA */
  getCachedClients() {
    return this.clients$.asObservable();
  }

  setCachedClients(clients: Client[]) {
    this.clients$.next(clients);
  }

  getCachedClient(clientId: number) {
    return this.clients$.getValue().find(cachedClient => cachedClient.id === clientId);
  }

  addCachedClient(client: DetailedClient) {
    this.clients$.next(this.helperService.sortByField([
      ...this.clients$.getValue(),
      client
    ]));
  }

  updateCachedClient(client: DetailedClient) {
    this.clients$.next(this.helperService.sortByField([
      ...this.clients$.getValue().filter(cachedClient => cachedClient.id !== client.id),
      client
    ]));
  }

  enableAllCachedClients(value: boolean) {
    this.clients$.next(this.helperService.sortByField([
      ...this.clients$.getValue().map(client => {
        return { ...client, master_schedule_enabled: value };
      })
    ]));
  }

  removeCachedClient(clientId: number) {
    this.clients$.next(
      this.clients$.getValue().filter(cachedClient => cachedClient.id !== clientId)
    );
  }

  /* FOLDER CACHED DATA */
  getCachedFolders() {
    return this.folders$.asObservable();
  }

  setCachedFolders(folders: Folder[]) {
    this.folders$.next(folders);
  }

  addCachedFolder(folder: Folder) {
    this.folders$.next(this.helperService.sortByField([
      ...this.folders$.getValue(),
      folder
    ]));
  }

  updateCachedFolder(folder: Folder) {
    this.folders$.next(this.helperService.sortByField([
      ...this.folders$.getValue().filter(cachedFolder => cachedFolder.id !== folder.id),
      folder
    ]));
  }

  removeCachedFolder(folderId: number) {
    this.globalService.removeOpenedFolder();
    this.folders$.next(
      this.folders$.getValue().filter(cachedFolder => cachedFolder.id !== folderId)
    );
  }

}
