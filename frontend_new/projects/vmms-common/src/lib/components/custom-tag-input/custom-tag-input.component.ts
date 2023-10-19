import {Component, inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {ListItem} from "../../interfaces/list-item";

@Component({
  selector: 'app-custom-tag-input',
  templateUrl: './custom-tag-input.component.html',
  styleUrls: ['./custom-tag-input.component.scss']
})
export class CustomTagInputComponent implements OnInit {

  private formBuilder = inject(FormBuilder);

  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() optionList: ListItem[] = [];
  @Input() fieldType: string = 'text';

  formGroup!: FormGroup;
  excludedList: ListItem[] = [];

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      tag: ['']
    });
    if (this.optionList.length) {
      this.excludedList = [...this.control.value];
    }
  }

  addTag() {
    const newValue = this.control.value;
    const newTagControl: FormControl = this.formGroup.get('tag') as FormControl;
    if (newTagControl?.value) {
      if (!this.optionList.length) {
        newValue.push(newTagControl?.value);
        this.control.setValue(newValue);
      } else {
        const targetItem = this.optionList
          .find(item => item.name.toLowerCase().includes(newTagControl?.value.toLowerCase()));
        if (targetItem) {
          newValue.push(targetItem.id);
          this.control.setValue(newValue);
          this.excludedList = [...this.control.value];
        }
      }
    }
    newTagControl.reset();
  }

  selectTag(event: MatAutocompleteSelectedEvent) {
    const newValue = this.control.value;
    const newTagControl: FormControl = this.formGroup.get('tag') as FormControl;
    newValue.push(event?.option.value);
    this.control.setValue(newValue);
    if (this.optionList.length) {
      this.excludedList = [...this.control.value];
    }
    newTagControl.reset();
  }

  removeTag(index: number) {
    const newValue = this.control.value;
    newValue.splice(index, 1);
    this.control.setValue(newValue);
    if (this.optionList.length) {
      this.excludedList = [...this.control.value];
    }
  }

}
