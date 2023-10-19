import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ListItem} from "../../interfaces/list-item";

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent {

  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() defaultValue: string = '';
  @Input() optionList: ListItem[] = [];

  @Output() inputChanged: EventEmitter<void> = new EventEmitter<void>();

}
