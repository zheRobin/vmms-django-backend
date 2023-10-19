import {Pipe, PipeTransform} from '@angular/core';
import {FileSystem} from "../../_interfaces/file-system";

@Pipe({
  name: 'filterFolderTree'
})
export class FilterFolderTreePipe implements PipeTransform {

  transform(fileSystem: FileSystem | null, search: string = ''): FileSystem | null {
    return {
      folders: fileSystem?.folders.filter(folder => this.search(folder, search)) || [],
      items: fileSystem?.items.filter((item: any) => this.search(item, search)) || [],
    };
  }

  compare(name: string, search: string) {
    return name?.toLowerCase().includes(search.toLowerCase())
  }

  search(item: any, search: string): boolean {
    if (!item) {
      return false;
    }
    return this.compare(item?.name, search) ||
      item?.folders?.filter((innerItem: any) => this.search(innerItem, search))?.length ||
      item?.programs?.filter((innerItem: any) => this.search(innerItem, search))?.length ||
      item?.playlists?.filter((innerItem: any) => this.search(innerItem, search))?.length;
  }

}
