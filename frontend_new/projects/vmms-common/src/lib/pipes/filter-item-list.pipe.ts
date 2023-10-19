import { Pipe, PipeTransform } from '@angular/core';
import {ListItem} from "../interfaces/list-item";

@Pipe({
  name: 'filterItemList'
})
export class FilterItemListPipe implements PipeTransform {

  transform(array: ListItem[] | null, excludedArray: any[]): ListItem[] {
    return array?.filter(item =>
      !excludedArray.find(excludedItem => parseInt(excludedItem) === item.id)
    ) || [];
  }

}
