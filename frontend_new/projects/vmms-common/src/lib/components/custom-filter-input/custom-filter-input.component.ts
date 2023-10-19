import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ListItem} from "../../interfaces/list-item";
import {
  booleanFilterList,
  dateFilterList,
  numericFilterList,
  selectorFilterList,
  textFilterList
} from "../../static/filter-lists";

@Component({
  selector: 'app-custom-filter-input',
  templateUrl: './custom-filter-input.component.html',
  styleUrls: ['./custom-filter-input.component.scss']
})
export class CustomFilterInputComponent {

  @Input() group!: FormGroup;
  @Input() optionList: ListItem[][] = [];
  @Output() filterRemoved: EventEmitter<void> = new EventEmitter<void>();

  fields = [
    ...textFilterList, ...selectorFilterList, ...numericFilterList, ...dateFilterList, ...booleanFilterList
  ];

  remove() {
    this.filterRemoved.emit();
  }

}
