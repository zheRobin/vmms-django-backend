import { Pipe, PipeTransform } from '@angular/core';
import {FileSystem, Folder} from "../../_interfaces/file-system";

@Pipe({
  name: 'isFolderOpened'
})
export class IsFolderOpenedPipe implements PipeTransform {

  transform(item: Folder, fileSystem: FileSystem | null, currentItem: any): boolean {
    if (!currentItem) {
      return false;
    }
    if (item.id === currentItem.id && item.type === currentItem.type) {
      return true;
    }
    const currentFolder = fileSystem?.folders.find(folder => folder.id === item.id);
    const openedItem = this.findItem(
        currentFolder?.folders || [],
      currentItem
    );
    return !!openedItem;
  }

  findItem(items: any[], currentItem: any): any {
    if (!items?.length) {
      return null;
    }
    const item = items?.find(item => item?.id === currentItem?.id && item?.type === currentItem?.type );
    if (!item) {
      return this.findItem(
        items?.map(item => item?.folders || [])
          .filter(item => item.length).flat() || [],
        currentItem
      );
    }
    return item;
  }

}
