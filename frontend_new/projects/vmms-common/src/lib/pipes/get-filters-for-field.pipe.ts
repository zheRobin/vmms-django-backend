import { Pipe, PipeTransform } from '@angular/core';
import {
  booleanFilterList,
  booleanFilterWordList, dateFilterList, dateFilterWordList,
  numericFilterList, numericFilterWordList,
  selectorFilterList,
  textFilterList,
  textFilterWordList
} from "../static/filter-lists";
import {ListItem} from "../interfaces/list-item";

@Pipe({
  name: 'getFiltersForField'
})
export class GetFiltersForFieldPipe implements PipeTransform {

  transform(field: string): ListItem[] {
    if (this.isIncluded(textFilterList, field)) {
      return textFilterWordList;
    }
    if (this.isIncluded(selectorFilterList, field)) {
      return booleanFilterWordList;
    }
    if (this.isIncluded(numericFilterList, field)) {
      return numericFilterWordList;
    }
    if (this.isIncluded(dateFilterList, field)) {
      return dateFilterWordList;
    }
    if (this.isIncluded(booleanFilterList, field)) {
      return booleanFilterWordList;
    }
    return [];
  }

  isIncluded(list: ListItem[], value: any): boolean {
    return !!list.find(item => item.id === value);
  }

}
