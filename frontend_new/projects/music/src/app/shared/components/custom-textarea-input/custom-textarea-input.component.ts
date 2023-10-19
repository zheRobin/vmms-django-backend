import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-textarea-input',
  templateUrl: './custom-textarea-input.component.html',
  styleUrls: ['./custom-textarea-input.component.scss']
})
export class CustomTextareaInputComponent {

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() rows: number = 3;

}
