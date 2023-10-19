import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ListItem} from "../../interfaces/list-item";

@Component({
  selector: 'app-custom-autocomplete-input',
  templateUrl: './custom-autocomplete-input.component.html',
  styleUrls: ['./custom-autocomplete-input.component.scss']
})
export class CustomAutocompleteInputComponent {

  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() optionList: ListItem[] = [];

  displayProperty(value: ListItem) {
    return value ? value.name : '';
  }

}
