import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {Observable, tap} from "rxjs";
import {User, GlobalService} from "vmms-common";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent implements OnInit {

  private authService = inject(AuthService);
  private globalService = inject(GlobalService);

  navItemList: { name: string, route: string, routerLink: boolean }[] = [
    { name: 'Clients', route: 'clients', routerLink: true },
    { name: 'Users', route: 'users', routerLink: true },
    { name: 'Schedule', route: 'schedules', routerLink: true },
    { name: 'Master Schedule', route: 'master-schedules', routerLink: true },
    { name: 'Group Schedule', route: 'client-groups', routerLink: true },
    { name: 'Player Versions', route: 'player-versions', routerLink: true },
    { name: 'Program Preview Links', route: 'link-previews', routerLink: true },
    { name: 'Music', route: environment.musicUrl, routerLink: false },
    { name: 'Video', route: environment.videoUrl, routerLink: false },
    { name: 'Promotion', route: environment.promotionUrl, routerLink: false },
    { name: 'Import', route: environment.importUrl, routerLink: false },
  ];

  currentUser$!: Observable<User>;

  ngOnInit() {
    this.currentUser$ = this.globalService.getCurrentUser().pipe(
      tap(user => {
        if (user.group === 'Users') {
          this.navItemList = this.navItemList.filter(navItem =>
            navItem.name !== 'Users' && navItem.name !== 'Player Versions'
          );
        }
      })
    );
  }

  logout() {
    this.authService.logout().subscribe();
  }

}
