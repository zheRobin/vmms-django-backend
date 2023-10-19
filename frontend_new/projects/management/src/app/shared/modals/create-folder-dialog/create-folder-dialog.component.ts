import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Folder} from "../../../_interfaces/file-system";
import {ClientService} from "../../../_services/client.service";

@Component({
  selector: 'app-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html',
  styleUrls: ['./create-folder-dialog.component.scss']
})
export class CreateFolderDialogComponent implements OnInit {

  private dialogRef = inject(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private clientService = inject(ClientService);

  data: {} = inject(MAT_DIALOG_DATA);
  formGroup!: FormGroup;

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required]
    })
  }

  createFolder() {
    this.clientService.createClientFolder(this.formGroup.get('name')?.value)
      .subscribe((folder: Folder) => this.dialogRef.close(folder));
  }

}
