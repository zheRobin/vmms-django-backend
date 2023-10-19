import { Pipe, PipeTransform } from '@angular/core';
import {FormArray, FormGroup} from "@angular/forms";

@Pipe({
  name: 'getFormArray'
})
export class GetFormArrayPipe implements PipeTransform {

  transform(formGroup: FormGroup, name: string): FormArray {
    return formGroup.get(name) as FormArray;
  }

}
