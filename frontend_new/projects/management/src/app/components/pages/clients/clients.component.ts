import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService, SelectedItem} from "vmms-common";
import {filter, Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {ClientService} from "../../../_services/client.service";
import {FileSystem} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  private router = inject(Router);
  private clientService = inject(ClientService);
  private globalService = inject(GlobalService);
  private dialog = inject(MatDialog);

  currentFileSystem$!: Observable<FileSystem>;
  searchControl: FormControl = new FormControl('');
  withContent: boolean = false;

  ngOnInit() {
    this.resetClients(false);
  }

  resetClients(checked: boolean) {
    this.withContent = checked;
    this.currentFileSystem$ = this.clientService.getClientFileSystem(checked).pipe(shareReplay());
  }

  select(clientId: number) {
    this.globalService.setCurrentItem({id: clientId, category: 'client'});
    this.router.navigateByUrl(`clients/client/${clientId}`);
  }

  create() {
    this.router.navigateByUrl('/clients/client/new');
  }

  copy(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Would you like to also copy scheduled events for the client?` }
    });

    dialogRef.afterClosed().pipe(
      switchMap((res: boolean) => {
        return this.clientService.copyClient(currentItem.id, res);
      }),
      tap(copiedClient => this.select(copiedClient.id))
    ).subscribe()
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this ${currentItem.category}? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res),
      switchMap(() => {
        if (currentItem.category === 'folder') {
          return this.clientService.deleteClientFolder(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/clients'))
          );
        }

        if (currentItem.category === 'client') {
          return this.clientService.deleteClient(currentItem.id).pipe(
            tap(() => this.router.navigateByUrl('/clients'))
          );
        }

        return of(null);
      })
    ).subscribe();
  }

  sync() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure that you want to sync client and player data?' }
    });

    dialogRef.afterClosed().pipe(
      filter(res => res),
      switchMap(() => this.clientService.syncClients())
    ).subscribe();
  }

}
