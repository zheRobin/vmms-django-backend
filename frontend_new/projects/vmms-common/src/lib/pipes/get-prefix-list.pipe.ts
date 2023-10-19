import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getPrefixList'
})
export class GetPrefixListPipe implements PipeTransform {

  transform(prefix: string): string[] {
    return prefix?.split(' ') || [];
  }

}
