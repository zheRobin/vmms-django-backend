import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getDependentsList'
})
export class GetDependentsListPipe implements PipeTransform {

  transform(dependents: any[]): string {
    return dependents.map(program => program.name).join('\n');
  }

}
