import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {PlaylistSong} from "../../../_interfaces/file-system";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-songs-preview',
  templateUrl: './songs-preview.component.html',
  styleUrls: ['./songs-preview.component.scss']
})
export class SongsPreviewComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() previewSongs: PlaylistSong[] = [];

  displayedColumns: string[] = ['artist', 'artist-add', 'title', 'title-add', 'tags', 'last-updated-by', 'edit'];
  dataSource!: MatTableDataSource<PlaylistSong>;

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<PlaylistSong>(this.previewSongs);
    this.dataSource.paginator = this.paginator;
  }

  navigateTo(id: number) {
    window.location.href = `${environment.importUrl}/songs/${id}/edit`;
  }

}
