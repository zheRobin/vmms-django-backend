import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  sortByField(array: any[], field: string = 'name') {
    return array.sort((a, b) => {
      const aName = a[field].toLowerCase();
      const bName = b[field].toLowerCase();

      if (aName > bName) {
        return 1;
      }

      if (aName < bName) {
        return -1;
      }

      return 0;
    });
  }

  sortByNumericField(array: any[], field: string = 'order') {
    return array.sort((a, b) => (+a[field]) - (+b[field]));
  }

  sortByDateField(array: any[], field: string) {
    return array.sort((a, b) => new Date(a[field]).getTime() -  new Date(b[field]).getTime());
  }

  sortVersions(array: any[], field: string, direction: 'asc' | 'desc' = 'asc') {
    const formattedArray = this.sortByField(array.map(a => {
      return { ...a, [field]: a[field].replace(/\d+/g, (n: any) => +n+100000) };
    }), field);

    if (direction === 'desc') {
      formattedArray.reverse();
    }

    return formattedArray.map(a => {
      return { ...a, [field]: a[field].replace(/\d+/g, (n: any) => +n-100000) };
    });
  }
}
