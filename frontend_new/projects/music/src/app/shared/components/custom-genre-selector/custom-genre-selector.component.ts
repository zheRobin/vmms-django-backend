import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Category, Genre} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-genre-selector',
  templateUrl: './custom-genre-selector.component.html',
  styleUrls: ['./custom-genre-selector.component.scss']
})
export class CustomGenreSelectorComponent implements OnChanges {

  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() categoryList: Category[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoryList']?.currentValue.length) {
      (this.control.value as number[]).forEach(selectedGenreId => {
        const targetGenre = this.categoryList
          .map(category => category.genres)
          .flat()
          .find(genre => genre?.id === selectedGenreId);
        if (targetGenre) {
          this.toggle(true, targetGenre);
        }
      });
    }
  }

  toggle(event: boolean, genre: Genre) {
    genre.isSelected = event;
    this.control.setValue(this.categoryList
      .map(category => category.genres)
      .flat()
      .filter(genre => genre?.isSelected)
    );
  }

}
