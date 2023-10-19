import { Pipe, PipeTransform } from '@angular/core';
import {ListItem} from "../interfaces/list-item";

@Pipe({
  name: 'getItemLabelById'
})
export class GetItemLabelByIdPipe implements PipeTransform {

  transform(id: any, array: ListItem[] | null): string {
    return array?.find(item => item.id === parseInt(id))?.name || '';
  }

}
