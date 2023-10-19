import { Pipe, PipeTransform } from '@angular/core';
import {
  booleanFilterList,
  dateFilterList,
  numericFilterList,
  selectorFilterList,
  textFilterList
} from "../static/filter-lists";
import {ListItem} from "../interfaces/list-item";

@Pipe({
  name: 'getFilterType'
})
export class GetFilterTypePipe implements PipeTransform {

  transform(field: string): string {
    if (this.isIncluded(textFilterList, field)) {
      return 'text';
    }
    if (this.isIncluded(selectorFilterList, field)) {
      return 'selector';
    }
    if (this.isIncluded(numericFilterList, field)) {
      return 'number';
    }
    if (this.isIncluded(dateFilterList, field)) {
      return 'date';
    }
    if (this.isIncluded(booleanFilterList, field)) {
      return 'text';
    }
    return 'text';
  }

  isIncluded(list: ListItem[], value: any): boolean {
    return !!list.find(item => item.id === value);
  }

}
