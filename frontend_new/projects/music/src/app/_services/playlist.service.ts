import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {combineLatest, map, Observable, switchMap, tap} from "rxjs";
import {Category, FileSystem, Folder, Genre, Playlist, Preview, Tag} from "../_interfaces/file-system";
import {
  DetailedPlaylist,
  PlaylistDependents,
  PlaylistPreviewPayload
} from "../_interfaces/detailed-playlist";
import {ToastrService} from "ngx-toastr";
import {FolderService, HelperService, ListItem} from "vmms-common";
import {PlaylistCacheService} from "./playlist-cache.service";

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private httpClient = inject(HttpClient);
  private playlistCacheService = inject(PlaylistCacheService);
  private folderService = inject(FolderService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllPlaylists(): Observable<Playlist[]> {
    return this.httpClient.get<Playlist[]>('/playlist/').pipe(
      map(playlists => this.helperService.sortByField(playlists)),
      tap(playlists => this.playlistCacheService.setCachedPlaylists(playlists))
      /*switchMap(playlists => {
        return forkJoin({
          playlists: of(playlists),
          counters: this.httpClient.get<any[]>(
            `/playlist/song-count/?ids=${playlists.map(playlist => playlist.id).join(',')}`
          )
        });
      }),*/
    );
  }

  getPlaylist(id: number): Observable<DetailedPlaylist> {
    return this.httpClient.get<DetailedPlaylist>(`/playlist/${id}/`);
  }

  getPlaylistDependents(id: number): Observable<PlaylistDependents> {
    return this.httpClient.get<PlaylistDependents>(`/playlist/${id}/dependents`);
  }

  getPlaylistPreview(filterForm: PlaylistPreviewPayload): Observable<Preview> {
    return this.httpClient.post<Preview>(`/playlist/preview/`, filterForm).pipe(
      map(preview => {
        return { ...preview, songs: this.helperService.sortByField(preview.songs, 'artist') };
      })
    );
  }

  createPlaylist(newPlaylistForm: Partial<DetailedPlaylist>): Observable<DetailedPlaylist> {
    return this.httpClient.post<DetailedPlaylist>('/playlist/', newPlaylistForm).pipe(
      tap(playlist => this.playlistCacheService.addCachedPlaylist(playlist)),
      tap(() => this.toastrService.success('Playlist has been created'))
    );
  }

  updatePlaylist(newPlaylistForm: Partial<DetailedPlaylist>, id: number): Observable<DetailedPlaylist> {
    return this.httpClient.put<DetailedPlaylist>(`/playlist/${id}/`, newPlaylistForm).pipe(
      tap(playlist => this.playlistCacheService.updateCachedPlaylist(playlist)),
      tap(() => this.toastrService.success('Playlist has been updated'))
    );
  }

  deletePlaylist(id: number): Observable<any> {
    return this.httpClient.delete<any>(`/playlist/${id}/`).pipe(
      tap(() => this.playlistCacheService.removeCachedPlaylist(id)),
      tap(() => this.toastrService.success('Playlist has been deleted'))
    );
  }

  uploadPlaylistCover(file: File) {
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

  getPlaylistsSoundsAmount(ids: number[]) {
    return this.httpClient.get<any[]>(`/playlist/song-count/?ids=${ids.join(',')}`);
  }

  getAllPlaylistFolders(): Observable<Folder[]> {
    return this.folderService.getAllFolders('playlist').pipe(
      tap(folders => this.playlistCacheService.setCachedFolders(folders))
    );
  }

  getPlaylistFolder(id: number): Observable<Folder> {
    return this.folderService.getFolder('playlist', id);
  }

  createPlaylistFolder(name: string) {
    return this.folderService.createFolder('playlist', name).pipe(
      tap(folder => this.playlistCacheService.addCachedFolder(folder)),
      tap(() => this.toastrService.success('Playlist Folder has been created'))
    );
  }

  updatePlaylistFolder(id: number, newFolderData: Partial<Folder>) {
    return this.folderService.updateFolder('playlist', id, newFolderData).pipe(
      tap(folder => this.playlistCacheService.updateCachedFolder(folder)),
      tap(() => this.toastrService.success('Playlist Folder has been updated'))
    );
  }

  deletePlaylistFolder(id: number) {
    return this.folderService.deleteFolder('playlist', id).pipe(
      tap(() => this.playlistCacheService.removeCachedFolder(id)),
      tap(() => this.toastrService.success('Playlist Folder has been deleted'))
    );
  }

  getPlaylistFileSystem(): Observable<FileSystem> {
    return combineLatest([this.getAllPlaylistFolders(), this.getAllPlaylists()]).pipe(
      switchMap(() => combineLatest([
        this.playlistCacheService.getCachedFolders(), this.playlistCacheService.getCachedPlaylists()
      ])),
      map(([folders, playlists]) => [
        folders.map(folder => {
          return {...folder, folders: [], playlists: [], type: 'folder'};
        }),
        playlists.map(playlist => {
          return {...playlist, type: 'playlist'};
        }) as any
      ]),
      map(([folders, playlists]) => [
        folders.map((currentFolder: Folder) => {
          if (currentFolder.parent) {
            folders.find((folder: Folder) => folder.id === currentFolder.parent)?.folders.push(currentFolder);
          }
          return currentFolder;
        }),
        playlists.map((currentPlaylist: Playlist) => {
          if (currentPlaylist.parent) {
            folders.find((folder: Folder) => folder.id === currentPlaylist.parent)?.playlists.push(currentPlaylist);
          }
          return currentPlaylist;
        })
      ]),
      map(([folders, playlists]) => {
        return {
          folders: folders.filter((folder: Folder) => !folder.parent),
          items: playlists.filter((playlist: Playlist) => !playlist.parent),
        };
      }),
    );
  }

  getFilterList(): Observable<ListItem[][]> {
    return this.httpClient.get<ListItem[][]>(`/filter/data/`);
  }

  getTagList(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(`/tag/`);
  }

  getCategoryList(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`/category/`).pipe(
      map(categories => this.helperService.sortByNumericField(categories))
    );
  }

  getGenreList(): Observable<Genre[]> {
    return this.httpClient.get<Genre[]>(`/genre/`).pipe(
      map(genres => genres.map(genre => {
        genre.isSelected = false;
        return genre;
      }))
    );
  }

  getCategoryStructure(): Observable<Category[]> {
    return combineLatest([this.getCategoryList(), this.getGenreList()]).pipe(
      map(([categories, genres]) => {
        return categories.map(category => {
          category.genres = [];
          category.genres = this.helperService.sortByNumericField(
            genres.filter(genre => genre.category === category.id)
          );
          return category;
        }).filter(category => category.genres?.length);
      })
    );
  }

}
