import { Pipe, PipeTransform } from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";

@Pipe({
  name: 'getFormControl'
})
export class GetFormControlPipe implements PipeTransform {

  transform(form: FormGroup | AbstractControl, name: string = ''): FormControl {
    return name ? form.get(name) as FormControl : form as FormControl;
  }

}
