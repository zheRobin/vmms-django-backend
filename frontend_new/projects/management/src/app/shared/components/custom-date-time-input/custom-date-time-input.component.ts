import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-date-time-input',
  templateUrl: './custom-date-time-input.component.html',
  styleUrls: ['./custom-date-time-input.component.scss']
})
export class CustomDateTimeInputComponent {

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;

}
