import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-file-input',
  templateUrl: './custom-file-input.component.html',
  styleUrls: ['./custom-file-input.component.scss']
})
export class CustomFileInputComponent {

  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() accept: string = 'image/*';
  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();

  @ViewChild('fileUpload') fileUpload!: ElementRef;

  upload(event: any) {
    this.fileSelected.emit(event.target.files[0]);
    this.fileUpload.nativeElement.value = '';
  }
}
