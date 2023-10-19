import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ListItem} from "vmms-common";

@Component({
  selector: 'app-custom-playlist-input',
  templateUrl: './custom-playlist-input.component.html',
  styleUrls: ['./custom-playlist-input.component.scss']
})
export class CustomPlaylistInputComponent {

  @Input() group!: FormGroup;
  @Input() optionList: ListItem[] = [];
  @Output() playlistRemoved: EventEmitter<void> = new EventEmitter<void>();

  remove() {
    this.playlistRemoved.emit();
  }

}
