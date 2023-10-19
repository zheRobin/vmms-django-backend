import {inject, Pipe, PipeTransform} from '@angular/core';
import {PlaylistService} from "../../_services/playlist.service";
import {map, Observable} from "rxjs";

@Pipe({
  name: 'getPlaylistSoundsAmount'
})
export class GetPlaylistSoundsAmountPipe implements PipeTransform {

  private playlistService = inject(PlaylistService);

  transform(playlistId: number): Observable<any> {
    return this.playlistService.getPlaylistsSoundsAmount([playlistId]).pipe(
      map(res => `(${res[playlistId]})`)
    );
  }

}
