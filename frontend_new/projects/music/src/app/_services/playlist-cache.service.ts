import {inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Folder, Playlist} from "../_interfaces/file-system";
import {DetailedPlaylist} from "../_interfaces/detailed-playlist";
import {GlobalService, HelperService} from "vmms-common";

@Injectable({
  providedIn: 'root'
})
export class PlaylistCacheService {

  private helperService = inject(HelperService);
  private globalService = inject(GlobalService);

  private playlists$: BehaviorSubject<Playlist[]> = new BehaviorSubject<Playlist[]>([]);
  private folders$: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  constructor() { }

  /* PLAYLIST CACHED DATA */
  getCachedPlaylists() {
    return this.playlists$.asObservable();
  }

  setCachedPlaylists(playlists: Playlist[]) {
    this.playlists$.next(playlists);
  }

  addCachedPlaylist(playlist: DetailedPlaylist) {
    this.playlists$.next(this.helperService.sortByField([
      ...this.playlists$.getValue(),
      playlist
    ]));
  }

  updateCachedPlaylist(playlist: DetailedPlaylist) {
    this.playlists$.next(this.helperService.sortByField([
      ...this.playlists$.getValue().filter(cachedPlaylist => cachedPlaylist.id !== playlist.id),
      playlist
    ]));
  }

  removeCachedPlaylist(playlistId: number) {
    this.playlists$.next(
      this.playlists$.getValue().filter(cachedPlaylist => cachedPlaylist.id !== playlistId)
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
