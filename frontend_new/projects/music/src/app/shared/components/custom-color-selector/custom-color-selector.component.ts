import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-color-selector',
  templateUrl: './custom-color-selector.component.html',
  styleUrls: ['./custom-color-selector.component.scss']
})
export class CustomColorSelectorComponent {

  @Input() label: string = '';
  @Input() control!: FormControl;

  palette: { color: string, border: string }[] = [
    {color: '#7bd148', border: '5px 0 0 0'},
    {color: '#5484ed', border: ''},
    {color: '#a4bdfc', border: ''},
    {color: '#46d6db', border: '0 5px 0 0'},
    {color: '#7ae7bf', border: ''},
    {color: '#51b749', border: ''},
    {color: '#fbd75b', border: ''},
    {color: '#ffb878', border: ''},
    {color: '#ff887c', border: '0 0 0 5px'},
    {color: '#dc2127', border: ''},
    {color: '#dbadff', border: ''},
    {color: '#e1e1e1', border: '0 0 5px 0'},
  ];

  selectColor(color: string) {
    this.control.setValue(color);
  }

}
