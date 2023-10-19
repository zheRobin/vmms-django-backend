import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ClientGroupService} from "../../../_services/client-group.service";
import {GlobalService, SelectedItem} from "vmms-common";
import {filter, Observable, shareReplay, switchMap, tap} from "rxjs";
import {DetailedClientGroup} from "../../../_interfaces/detailed-client-group";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-client-groups',
  templateUrl: './client-groups.component.html',
  styleUrls: ['./client-groups.component.scss']
})
export class ClientGroupsComponent implements OnInit {

  private router = inject(Router);
  private clientGroupService = inject(ClientGroupService);
  private globalService = inject(GlobalService);
  private dialog = inject(MatDialog);

  groups$!: Observable<DetailedClientGroup[]>;
  currentItem$!: Observable<SelectedItem | null>;

  ngOnInit() {
    this.currentItem$ = this.globalService.getCurrentItem().pipe(shareReplay());
    this.groups$ = this.clientGroupService.getAllClientGroups().pipe(shareReplay());
  }

  select(groupId: number) {
    this.globalService.setCurrentItem({id: groupId, category: 'client-group'});
    this.router.navigateByUrl(`/client-groups/client-group/${groupId}`);
  }

  create() {
    this.router.navigateByUrl(`/client-groups/client-group/new`);
  }

  edit(currentItem: SelectedItem) {
    this.router.navigateByUrl(`/client-groups/client-group/${currentItem.id}/edit`);
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this client group? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        return this.clientGroupService.deleteClientGroup(currentItem.id).pipe(
          tap(() => this.router.navigateByUrl(`/client-groups`))
        );
      })
    ).subscribe();
  }

}
