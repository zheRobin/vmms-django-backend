import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {PlaylistService} from "../../../_services/playlist.service";
import {filter, Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {FileSystem} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";
import {SelectedItem} from "vmms-common";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {

  private router = inject(Router);
  private playlistService = inject(PlaylistService);
  private dialog = inject(MatDialog);

  currentFileSystem$!: Observable<FileSystem>;
  searchControl: FormControl = new FormControl('');

  ngOnInit() {
    this.currentFileSystem$ = this.playlistService.getPlaylistFileSystem().pipe(shareReplay());
  }

  createContentPool() {
    this.router.navigateByUrl('/playlists/playlist/new');
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this ${currentItem.category}? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        if (currentItem.category === 'folder') {
          return this.playlistService.deletePlaylistFolder(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/playlists'))
          );
        }

        if (currentItem.category === 'playlist') {
          return this.playlistService.deletePlaylist(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/playlists'))
          );
        }

        return of(null);
      }),
    ).subscribe();



  }

}
