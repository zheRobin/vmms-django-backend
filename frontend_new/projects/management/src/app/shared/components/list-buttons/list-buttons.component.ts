import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Folder} from "../../../_interfaces/file-system";
import {Observable} from "rxjs";
import {GlobalService, SelectedItem} from "vmms-common";
import {CreateFolderDialogComponent} from "../../modals/create-folder-dialog/create-folder-dialog.component";

@Component({
  selector: 'app-list-buttons',
  templateUrl: './list-buttons.component.html',
  styleUrls: ['./list-buttons.component.scss']
})
export class ListButtonsComponent implements OnInit {

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private globalService = inject(GlobalService);

  currentItem$!: Observable<SelectedItem | null>;

  @Input() showCopyButton: boolean = false;
  @Input() showSyncButton: boolean = false;

  @Output() itemCreation: EventEmitter<void> = new EventEmitter<void>();
  @Output() itemCopied: EventEmitter<SelectedItem> = new EventEmitter<SelectedItem>();
  @Output() itemDeletion: EventEmitter<SelectedItem> = new EventEmitter<SelectedItem>();
  @Output() syncClicked: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {
    this.currentItem$ = this.globalService.getCurrentItem();
  }

  createFolder() {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent);

    dialogRef.afterClosed().subscribe((folder: Folder) => {
      if (folder) {
        this.router.navigateByUrl(`/clients/folder/${folder.id}`);
      }
    });
  }

  create() {
    this.itemCreation.emit();
  }

  copy(currentItem: SelectedItem) {
    this.itemCopied.emit(currentItem);
  }

  delete(currentItem: SelectedItem) {
    this.itemDeletion.emit(currentItem);
  }

  sync() {
    this.syncClicked.emit();
  }

}
