import {Component, inject} from '@angular/core';
import {filter, Observable, switchMap} from "rxjs";
import {DetailedLinkPreview} from "../../../_interfaces/detailed-link-preview";
import {LinkPreviewService} from "../../../_services/link-preview.service";
import {Router} from "@angular/router";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-link-previews',
  templateUrl: './link-previews.component.html',
  styleUrls: ['./link-previews.component.scss']
})
export class LinkPreviewsComponent {

  private linkPreviewService = inject(LinkPreviewService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  previewLinks$!: Observable<DetailedLinkPreview[]>;

  ngOnInit() {
    this.previewLinks$ = this.linkPreviewService.getAllLinkPreviews();
  }

  add() {
    this.router.navigateByUrl('/link-previews/link-preview/new');
  }

  edit(id: number) {
    this.router.navigateByUrl(`/link-previews/link-preview/${id}`);
  }

  remove(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this link preview? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        return this.linkPreviewService.deleteLinkPreview(id);
      })
    ).subscribe();
  }

}
