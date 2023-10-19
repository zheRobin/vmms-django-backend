import { Pipe, PipeTransform } from '@angular/core';
import {ListItem} from "../interfaces/list-item";

@Pipe({
  name: 'filterItemListBySearch'
})
export class FilterItemListBySearchPipe implements PipeTransform {

  transform(array: ListItem[] | null, search: string | ListItem = ''): any[] {
    return (
      search && typeof search === 'string'
        ? array?.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        : array
    ) || [];
  }

}
