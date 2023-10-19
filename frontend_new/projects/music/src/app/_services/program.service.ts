import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FolderService, HelperService} from "vmms-common";
import {ToastrService} from "ngx-toastr";
import {combineLatest, map, Observable, switchMap, tap} from "rxjs";
import {FileSystem, Folder, Preview} from "../_interfaces/file-system";
import {ProgramCacheService} from "./program-cache.service";
import {DetailedProgram, ProgramDependents, ProgramPreviewPayload} from "../_interfaces/detailed-program";

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  private httpClient = inject(HttpClient);
  private programCacheService = inject(ProgramCacheService);
  private folderService = inject(FolderService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllPrograms(): Observable<any> {
    return this.httpClient.get<any>('/program/').pipe(
      map(programs => this.helperService.sortByField(programs)),
      tap(programs => this.programCacheService.setCachedPrograms(programs)),
    );
  }

  getProgram(id: number): Observable<DetailedProgram> {
    return this.httpClient.get<DetailedProgram>(`/program/${id}/`);
  }

  getProgramDependents(id: number): Observable<ProgramDependents> {
    return this.httpClient.get<ProgramDependents>(`/program/${id}/dependents`);
  }

  getProgramPreview(filterForm: ProgramPreviewPayload): Observable<Preview> {
    return this.httpClient.post<Preview>(`/program/preview/`, filterForm).pipe(
      map(preview => {
        return { ...preview, songs: this.helperService.sortByField(preview.songs, 'artist') };
      })
    );
  }

  createProgram(newProgramForm: Partial<any>): Observable<DetailedProgram> {
    return this.httpClient.post<DetailedProgram>('/program/', newProgramForm).pipe(
      tap(program => this.programCacheService.addCachedProgram(program)),
      tap(() => this.toastrService.success('Program has been created'))
    );
  }

  updateProgram(newProgramForm: Partial<any>, id: number): Observable<DetailedProgram> {
    return this.httpClient.put<DetailedProgram>(`/program/${id}/`, newProgramForm).pipe(
      tap(program => this.programCacheService.updateCachedProgram(program)),
      tap(() => this.toastrService.success('Program has been updated'))
    );
  }

  deleteProgram(id: number): Observable<any> {
    return this.httpClient.delete<any>(`/program/${id}/`).pipe(
      tap(program => this.programCacheService.removeCachedProgram(program)),
      tap(() => this.toastrService.success('Program has been deleted'))
    );
  }

  uploadProgramCover(file: File) {
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

  getAllProgramFolders(): Observable<Folder[]> {
    return this.folderService.getAllFolders('program').pipe(
      tap(folders => this.programCacheService.setCachedFolders(folders))
    );
  }

  getProgramFolder(id: number): Observable<Folder> {
    return this.folderService.getFolder('program', id);
  }

  createProgramFolder(name: string) {
    return this.folderService.createFolder('program', name).pipe(
      tap(folder => this.programCacheService.addCachedFolder(folder)),
      tap(() => this.toastrService.success('Program Folder has been created'))
    );
  }

  updateProgramFolder(id: number, newFolderData: Partial<Folder>) {
    return this.folderService.updateFolder('program', id, newFolderData).pipe(
      tap(folder => this.programCacheService.updateCachedFolder(folder)),
      tap(() => this.toastrService.success('Program Folder has been updated'))
    );
  }

  deleteProgramFolder(id: number) {
    return this.folderService.deleteFolder('program', id).pipe(
      tap(() => this.programCacheService.removeCachedFolder(id)),
      tap(() => this.toastrService.success('Program Folder has been deleted'))
    );
  }

  getProgramFileSystem(): Observable<FileSystem> {
    return combineLatest([this.getAllProgramFolders(), this.getAllPrograms()]).pipe(
      switchMap(() => combineLatest([
        this.programCacheService.getCachedFolders(), this.programCacheService.getCachedPrograms()
      ])),
      map(([folders, programs]) => [
        folders.map(folder => {
          return {...folder, folders: [], programs: [], type: 'folder'};
        }),
        programs.map(program => {
          return {...program, type: 'program',
            playlists: program.playlists.map(playlist => {
              return {...playlist, type: 'playlist'};
            })
          };
        }) as any
      ]),
      map(([folders, programs]) => [
        folders.map((currentFolder: Folder) => {
          if (currentFolder.parent) {
            folders.find((folder: Folder) => folder.id === currentFolder.parent)?.folders.push(currentFolder);
          }
          return currentFolder;
        }),
        programs.map((currentProgram: any) => {
          if (currentProgram.parent) {
            folders.find((folder: Folder) => folder.id === currentProgram.parent)?.programs.push(currentProgram);
          }
          return currentProgram;
        })
      ]),
      map(([folders, programs]) => {
        return {
          folders: folders.filter((folder: Folder) => !folder.parent),
          items: programs.filter((program: any) => !program.parent),
        };
      }),
    );
  }

}
