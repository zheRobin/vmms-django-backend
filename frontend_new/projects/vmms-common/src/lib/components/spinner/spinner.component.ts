import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

  @Input() height: number = 20;
  @Input() width: number = 20;
  @Input() withoutBorder: boolean = false;

}
