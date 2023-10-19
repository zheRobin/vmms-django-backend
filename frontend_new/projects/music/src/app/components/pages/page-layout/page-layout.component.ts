import {Component, inject} from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {Observable, tap} from "rxjs";
import {User, GlobalService} from "vmms-common";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {

  private authService = inject(AuthService);
  private globalService = inject(GlobalService);

  navItemList: { name: string, route: string, routerLink: boolean }[] = [
    { name: 'Content pools', route: 'playlists', routerLink: true },
    { name: 'Programs', route: 'programs', routerLink: true },
    { name: 'Users', route: 'users', routerLink: true },
    { name: 'Management', route: environment.managementUrl, routerLink: false },
    { name: 'Import', route: environment.importUrl, routerLink: false },
  ];

  currentUser$!: Observable<User>;

  ngOnInit() {
    this.currentUser$ = this.globalService.getCurrentUser().pipe(
      tap(user => {
        if (user.group === 'Users') {
          this.navItemList = this.navItemList.filter(navItem =>
            navItem.name !== 'Users'
          );
        }
      })
    );
  }

  logout() {
    this.authService.logout().subscribe();
  }

}
