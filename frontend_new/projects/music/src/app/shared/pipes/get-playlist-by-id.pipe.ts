import {inject, Pipe, PipeTransform} from '@angular/core';
import {PlaylistService} from "../../_services/playlist.service";
import {DetailedPlaylist} from "../../_interfaces/detailed-playlist";
import {Observable} from "rxjs";

@Pipe({
  name: 'getPlaylistById'
})
export class GetPlaylistByIdPipe implements PipeTransform {

  private playlistService = inject(PlaylistService);

  transform(id: number): Observable<DetailedPlaylist> {
    return this.playlistService.getPlaylist(id);
  }

}
