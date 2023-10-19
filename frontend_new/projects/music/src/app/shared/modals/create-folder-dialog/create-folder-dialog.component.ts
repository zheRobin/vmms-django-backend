import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Folder} from "../../../_interfaces/file-system";
import {PlaylistService} from "../../../_services/playlist.service";
import {ProgramService} from "../../../_services/program.service";

@Component({
  selector: 'app-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html',
  styleUrls: ['./create-folder-dialog.component.scss']
})
export class CreateFolderDialogComponent implements OnInit {

  private dialogRef = inject(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private playlistService = inject(PlaylistService);
  private programService = inject(ProgramService);

  data: { contentType: 'Content Pool' | 'Program' } = inject(MAT_DIALOG_DATA);
  formGroup!: FormGroup;

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required]
    })
  }

  createFolder() {
    (this.data.contentType === 'Content Pool'
      ? this.playlistService.createPlaylistFolder(this.formGroup.get('name')?.value)
      : this.programService.createProgramFolder(this.formGroup.get('name')?.value)
    ).subscribe((folder: Folder) => this.dialogRef.close(folder));
  }

}
