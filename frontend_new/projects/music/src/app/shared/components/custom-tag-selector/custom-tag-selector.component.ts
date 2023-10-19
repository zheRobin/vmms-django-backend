import {Component, inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {ListItem} from "vmms-common";

@Component({
  selector: 'app-custom-tag-selector',
  templateUrl: './custom-tag-selector.component.html',
  styleUrls: ['./custom-tag-selector.component.scss'],
})
export class CustomTagSelectorComponent  implements OnInit {

  private formBuilder = inject(FormBuilder);

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() tagStyle: 'default' | 'include' | 'exclude' = 'default'
  @Input() control!: FormControl;
  @Input() optionList: ListItem[] = [];
  @Input() excludedList: ListItem[] = [];

  formGroup!: FormGroup;

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      tag: ['']
    })
  }

  selectTag(event: MatAutocompleteSelectedEvent) {
    const newValue = this.control.value;
    const newTagControl: FormControl = this.formGroup.get('tag') as FormControl;
    newValue.push(event?.option.value);
    this.control.setValue(newValue);
    newTagControl.reset();
  }

  removeTag(index: number) {
    const newValue = this.control.value;
    newValue.splice(index, 1);
    this.control.setValue(newValue);
  }

}
