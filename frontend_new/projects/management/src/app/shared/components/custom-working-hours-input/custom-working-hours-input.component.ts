import {Component, Input} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-custom-working-hours-input',
  templateUrl: './custom-working-hours-input.component.html',
  styleUrls: ['./custom-working-hours-input.component.scss']
})
export class CustomWorkingHoursInputComponent {

  @Input() label: string = '';
  @Input() group!: FormGroup;

  enable(isOpen: boolean) {
    if (isOpen) {
      this.group.get('openingHours')?.enable();
      this.group.get('openingMinutes')?.enable();
      this.group.get('closingHours')?.enable();
      this.group.get('closingMinutes')?.enable();
    } else {
      this.group.reset();
      this.group.get('openingHours')?.disable();
      this.group.get('openingMinutes')?.disable();
      this.group.get('closingHours')?.disable();
      this.group.get('closingMinutes')?.disable();
    }
  }

  increase(control: FormControl, placeholder: 'HH' | 'mm') {
    if (this.group.get('open')?.value) {
      const newValue = parseInt(control.value || 0);
      control.setValue(newValue + 1);
      this.updateValue(control, placeholder);
    }
  }

  decrease(control: FormControl, placeholder: 'HH' | 'mm') {
    if (this.group.get('open')?.value) {
      const newValue = parseInt(control.value || 0);
      control.setValue(newValue - 1);
      this.updateValue(control, placeholder);
    }
  }

  setDefault(control: FormControl) {
    if (control.value) {
      const newValue = parseInt(control.value || 0);
      control.setValue(newValue);
    }
  }

  updateValue(control: FormControl, placeholder: 'HH' | 'mm') {
    const value = parseInt(control.value || 0);

    if (value < 0) {
      return control.setValue('00');
    }
    if (value < 10) {
      return control.setValue(`0${value}`);
    }
    if (value > 24 && placeholder === 'HH') {
      return control.setValue('23');
    }
    if (value > 59 && placeholder === 'mm') {
      return control.setValue('59');
    }
  }

}
