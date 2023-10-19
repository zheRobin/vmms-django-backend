import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {CreateFolderDialogComponent} from "../../modals/create-folder-dialog/create-folder-dialog.component";
import {Router} from "@angular/router";
import {Folder} from "../../../_interfaces/file-system";
import {filter, Observable, tap} from "rxjs";
import {ConfirmationDialogComponent} from "../../modals/confirmation-dialog/confirmation-dialog.component";
import {GlobalService, SelectedItem} from "vmms-common";

@Component({
  selector: 'app-list-buttons',
  templateUrl: './list-buttons.component.html',
  styleUrls: ['./list-buttons.component.scss']
})
export class ListButtonsComponent implements OnInit {

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private globalService = inject(GlobalService);

  @Input() contentType: 'Content Pool' | 'Program' = 'Content Pool';
  currentItem$!: Observable<SelectedItem | null>;

  @Output() itemCreation: EventEmitter<void> = new EventEmitter<void>();
  @Output() itemDeletion: EventEmitter<SelectedItem> = new EventEmitter<SelectedItem>();

  ngOnInit() {
    this.currentItem$ = this.globalService.getCurrentItem();
  }

  createFolder() {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent, {
      data: { contentType: this.contentType }
    });

    dialogRef.afterClosed().subscribe((folder: Folder) => {
      if (folder) {
        this.router.navigateByUrl(
          `/${this.contentType === 'Content Pool' ? 'playlists' : 'programs'}/folder/${folder.id}`
        );
      }
    });
  }

  create() {
    this.itemCreation.emit();
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this ${currentItem.category}? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      tap(() => this.itemDeletion.emit(currentItem)),
    ).subscribe();
  }

}
