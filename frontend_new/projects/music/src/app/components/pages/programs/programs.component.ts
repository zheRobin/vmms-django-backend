import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {filter, Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {FileSystem} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";
import {ProgramService} from "../../../_services/program.service";
import {SelectedItem} from "vmms-common";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit {

  private router = inject(Router);
  private programService = inject(ProgramService);
  private dialog = inject(MatDialog);

  currentFileSystem$!: Observable<FileSystem>;
  searchControl: FormControl = new FormControl('');

  ngOnInit() {
    this.currentFileSystem$ = this.programService.getProgramFileSystem().pipe(shareReplay());
  }

  createProgram() {
    this.router.navigateByUrl('/programs/program/new');
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this ${currentItem.category}? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        if (currentItem.category === 'folder') {
          return this.programService.deleteProgramFolder(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/programs'))
          );
        }

        if (currentItem.category === 'program') {
          return this.programService.deleteProgram(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/programs'))
          );
        }

        return of(null);
      })
    ).subscribe();
  }

}
