import { Pipe, PipeTransform } from '@angular/core';
import {AbstractControl, FormGroup} from "@angular/forms";

@Pipe({
  name: 'getFormGroup'
})
export class GetFormGroupPipe implements PipeTransform {

  transform(formGroup: AbstractControl): FormGroup {
    return formGroup as FormGroup;
  }

}
