import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

  private dialogRef = inject(MatDialogRef);

  data: { message: string } = inject(MAT_DIALOG_DATA);

  constructor() {}

  confirm() {
    this.dialogRef.close(true);
  }
}
