import { Pipe, PipeTransform } from '@angular/core';
import {FileSystem, Folder} from "../../_interfaces/file-system";

@Pipe({
  name: 'getInnerFileSystem'
})
export class GetInnerFileSystemPipe implements PipeTransform {

  transform(folder: Folder): FileSystem {
    return { folders: folder.folders || [], items: [...(folder.playlists || []), ...(folder.programs || [])] };
  }

}
