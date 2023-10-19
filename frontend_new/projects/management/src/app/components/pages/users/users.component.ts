import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {filter, Observable, shareReplay, switchMap, tap} from "rxjs";
import {GlobalService, SelectedItem, User, UserService} from "vmms-common";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {

  private router = inject(Router);
  private userService = inject(UserService);
  private globalService = inject(GlobalService);
  private dialog = inject(MatDialog);

  userList$!: Observable<User[]>;

  currentItem$!: Observable<SelectedItem | null>;

  ngOnInit() {
    this.userList$ = this.userService.getUserData().pipe(shareReplay());
    this.currentItem$ = this.globalService.getCurrentItem();
  }

  select(userId: number) {
    this.globalService.setCurrentItem({id: userId, category: 'user'});
    this.router.navigateByUrl(`/users/user/${userId}`);
  }

  create() {
    this.router.navigateByUrl('/users/user/new');
  }

  delete(currentItem: SelectedItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this user? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        return this.userService.deleteUser(currentItem.id).pipe(
          tap(() => this.router.navigateByUrl('/users'))
        );
      })
    ).subscribe();
  }

}
