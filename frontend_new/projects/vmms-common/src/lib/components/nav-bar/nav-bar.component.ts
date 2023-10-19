import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {ResponsiveService} from "../../modules/responsive/responsive.service";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {

  private responsiveService = inject(ResponsiveService);

  @Input() title: string = 'VMMS';
  @Input() navItemList: { name: string, route: string, routerLink: boolean }[] = [];

  @Output() logoutClicked: EventEmitter<void> = new EventEmitter<void>();

  showExpansionPanel: boolean = false;

  get isDesktop() {
    return this.responsiveService.isDesktop;
  }

  navigateTo(url: string) {
    window.location.href = url;
  }

  toggle() {
    this.showExpansionPanel = !this.showExpansionPanel;
  }

  logout() {
    this.logoutClicked.emit();
  }

}
