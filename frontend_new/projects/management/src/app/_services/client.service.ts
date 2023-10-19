import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ClientCacheService} from "./client-cache.service";
import {combineLatest, map, Observable, switchMap, tap} from "rxjs";
import {FolderService, HelperService, ListItem} from "vmms-common";
import {ToastrService} from "ngx-toastr";
import {Client, FileSystem, Folder} from "../_interfaces/file-system";
import {DetailedClient} from "../_interfaces/detailed-client";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private httpClient = inject(HttpClient);
  private clientCacheService = inject(ClientCacheService);
  private folderService = inject(FolderService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() {}

  getAllClients(withContent: boolean = false, withFolder: boolean = false): Observable<Client[]> {
    let params: string = '';

    if (withContent) {
      params += `?`;
      params += `onlyClientsWithContent=${withContent}`;
    }

    if (withFolder) {
      params += (params ? '&' : '?');
      params += `includeFolder=${withFolder}`;
    }

    return this.httpClient.get<Client[]>(`/client/${params}`).pipe(
      map(clients => this.helperService.sortByField(clients)),
      tap(clients => this.clientCacheService.setCachedClients(clients))
    );
  }

  syncClients() {
    this.toastrService.info('Contacting monitoring...');
    return this.httpClient.get<any>('/client/sync/').pipe(
      tap(() => this.toastrService.success('Sync request sent. It might take some time for the process to complete.'))
    );
  }

  getClient(id: number): Observable<DetailedClient> {
    return this.httpClient.get<DetailedClient>(`/client/${id}/`);
  }

  createClient(newClientForm: Partial<DetailedClient>): Observable<DetailedClient> {
    return this.httpClient.post<DetailedClient>('/client/', newClientForm).pipe(
      tap(client => this.clientCacheService.addCachedClient(client)),
      tap(() => this.toastrService.success('Client has been created'))
    );
  }

  copyClient(id: number, withEvents: boolean) {
    let params: string = '';
    if (withEvents) {
      params += `?`;
      params += `with_events=${withEvents}`;
    }

    return this.httpClient.post<DetailedClient>(`/client/${id}/copy/${params}`, {}).pipe(
      tap(client => this.clientCacheService.addCachedClient(client)),
      tap(() => this.toastrService.success('Client has been created'))
    );
  }

  updateClient(newClientForm: Partial<DetailedClient>, id: number): Observable<DetailedClient> {
    return this.httpClient.put<DetailedClient>(`/client/${id}/`, newClientForm).pipe(
      tap(client => this.clientCacheService.updateCachedClient(client)),
      tap(() => this.toastrService.success('Client has been updated'))
    );
  }

  enableMasterSchedule(value: boolean = false, id?: number) {
    if (id) {
      return this.httpClient.put<any>(`/client/${id}/master-schedule/?master-schedule=${value}`, {id: id}).pipe(
        tap(client => this.clientCacheService.updateCachedClient(client)),
        tap(() => this.toastrService.success('Client has been updated'))
      );
    }
    return this.httpClient.put<any>(`/client/master-schedule/?master-schedule=${value}`, []).pipe(
      tap(() => this.clientCacheService.enableAllCachedClients(value)),
      tap(() => this.toastrService.success('All Clients have been updated'))
    );
  }

  deleteClient(id: number): Observable<any> {
    return this.httpClient.delete<any>(`/client/${id}/`).pipe(
      tap(() => this.clientCacheService.removeCachedClient(id)),
      tap(() => this.toastrService.success('Client has been deleted'))
    );
  }

  getAllClientFolders(): Observable<Folder[]> {
    return this.folderService.getAllFolders('client').pipe(
      tap(folders => this.clientCacheService.setCachedFolders(folders))
    );
  }

  getClientFolder(id: number): Observable<Folder> {
    return this.folderService.getFolder('client', id);
  }

  createClientFolder(name: string) {
    return this.folderService.createFolder('client', name).pipe(
      tap(folder => this.clientCacheService.addCachedFolder(folder)),
      tap(() => this.toastrService.success('Client Folder has been created'))
    );
  }

  updateClientFolder(id: number, newFolderData: Partial<Folder>) {
    return this.folderService.updateFolder('client', id, newFolderData).pipe(
      tap(folder => this.clientCacheService.updateCachedFolder(folder)),
      tap(() => this.toastrService.success('Client Folder has been updated'))
    );
  }

  deleteClientFolder(id: number) {
    return this.folderService.deleteFolder('client', id).pipe(
      tap(() => this.clientCacheService.removeCachedFolder(id)),
      tap(() => this.toastrService.success('Client Folder has been deleted'))
    );
  }

  getClientFileSystem(onlyWithContent: boolean = false): Observable<FileSystem> {
    return combineLatest([this.getAllClientFolders(), this.getAllClients(onlyWithContent)]).pipe(
      switchMap(() => combineLatest([
        this.clientCacheService.getCachedFolders(), this.clientCacheService.getCachedClients()
      ])),
      map(([folders, clients]) => [
        folders.map(folder => {
          return {...folder, folders: [], clients: [], type: 'folder'};
        }),
        clients.map(client => {
          return {...client, type: 'client'};
        }) as any
      ]),
      map(([folders, clients]) => [
        folders.map((currentFolder: Folder) => {
          if (currentFolder.parent) {
            folders.find((folder: Folder) => folder.id === currentFolder.parent)?.folders.push(currentFolder);
          }
          return currentFolder;
        }),
        clients.map((currentClient: Client) => {
          if (currentClient.parent) {
            folders.find((folder: Folder) => folder.id === currentClient.parent)?.clients.push(currentClient);
          }
          return currentClient;
        })
      ]),
      map(([folders, clients]) => {
        return {
          folders: folders.filter((folder: Folder) => !folder.parent),
          items: clients.filter((client: Client) => !client.parent),
        };
      }),
    );
  }

  getFilterList(): Observable<ListItem[][]> {
    return this.httpClient.get<ListItem[][]>(`/filter/data/`);
  }

  getProgramList(): Observable<ListItem[]> {
    return this.httpClient.get<ListItem[]>('/program/').pipe(
      map(programs => programs.map(program => {
        return { id: program.id, name: program.name };
      }))
    );
  }

  getPromotionList(): Observable<ListItem[]> {
    return this.httpClient.get<ListItem[]>(`/promotion/`);
  }

}
