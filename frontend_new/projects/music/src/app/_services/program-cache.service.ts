import {inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Folder, Program} from "../_interfaces/file-system";
import {DetailedProgram} from "../_interfaces/detailed-program";
import {GlobalService, HelperService} from "vmms-common";

@Injectable({
  providedIn: 'root'
})
export class ProgramCacheService {

  private helperService = inject(HelperService);
  private globalService = inject(GlobalService);

  private programs$: BehaviorSubject<Program[]> = new BehaviorSubject<Program[]>([]);
  private folders$: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  constructor() { }

  /* PROGRAM CACHED DATA */
  getCachedPrograms() {
    return this.programs$.asObservable();
  }

  setCachedPrograms(programs: Program[]) {
    this.programs$.next(programs);
  }

  addCachedProgram(program: DetailedProgram) {
    this.programs$.next(this.helperService.sortByField([
      ...this.programs$.getValue(),
      program
    ]));
  }

  updateCachedProgram(program: DetailedProgram) {
    this.programs$.next(this.helperService.sortByField([
      ...this.programs$.getValue().filter(cachedProgram => cachedProgram.id !== program.id),
      program
    ]));
  }

  removeCachedProgram(programId: number) {
    this.programs$.next(
      this.programs$.getValue().filter(cachedProgram => cachedProgram.id !== programId)
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
