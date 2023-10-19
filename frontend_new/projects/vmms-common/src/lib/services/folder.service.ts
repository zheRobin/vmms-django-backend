import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {HelperService} from "./helper.service";
import {Folder} from "../interfaces/file-system";

export type FolderCategory = 'playlist' | 'program' | 'client';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  private httpClient = inject(HttpClient);
  private helperService = inject(HelperService);

  constructor() {}

  getAllFolders(category: FolderCategory): Observable<Folder[]> {
    return this.httpClient.get<Folder[]>(`/${category}-folder/`).pipe(
      map(folders => this.helperService.sortByField(folders)),
    );
  }

  getFolder(category: FolderCategory, id: number): Observable<Folder> {
    return this.httpClient.get<Folder>(`/${category}-folder/${id}/`);
  }

  createFolder(category: FolderCategory, name: string): Observable<Folder> {
    return this.httpClient.post<Folder>(`/${category}-folder/`, { name: name });
  }

  updateFolder(category: FolderCategory, id: number, folder: Partial<Folder>): Observable<Folder> {
    return this.httpClient.put<Folder>(`/${category}-folder/${id}/`, folder);
  }

  deleteFolder(category: FolderCategory, id: number) {
    return this.httpClient.delete<void>(`/${category}-folder/${id}/`);
  }

}
