import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService, SelectedItem, ListItem} from "vmms-common";
import {PlayerVersionService} from "../../../_services/player-version.service";
import {Observable, shareReplay, tap} from "rxjs";
import {PlayerVersion} from "../../../_interfaces/player-version";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-player-versions',
  templateUrl: './player-versions.component.html',
  styleUrls: ['./player-versions.component.scss'],
})
export class PlayerVersionsComponent implements OnInit {

  private router = inject(Router);
  private playerVersionService = inject(PlayerVersionService);
  private globalService = inject(GlobalService);

  playerVersionList$!: Observable<PlayerVersion[]>;
  currentPlayerVersion$!: Observable<PlayerVersion | null>;
  versionControl!: FormControl;
  optionList: ListItem[] = [];

  currentItem$!: Observable<SelectedItem | null>;

  ngOnInit() {
    this.playerVersionList$ = this.playerVersionService.getAllPlayerVersions().pipe(
      shareReplay(),
      tap(versions => this.optionList = versions.map(version => {
        return { id: version.id, name: version.version_string };
      })),
      tap(() => this.currentPlayerVersion$ = this.playerVersionService.getCurrentPlayerVersion().pipe(
        tap(version =>
          this.versionControl = new FormControl({ value: version?.id, disabled: true })
        ),
      ))
    );

    this.currentItem$ = this.globalService.getCurrentItem();
  }

  select(versionId: number) {
    this.globalService.setCurrentItem({id: versionId, category: 'player-version'});
    this.router.navigateByUrl(`/player-versions/player-version/${versionId}`);
  }

  create() {
    this.router.navigateByUrl('/player-versions/player-version/new');
  }

  editPlayerVersion() {
    this.versionControl.enable();
  }

  savePlayerVersion() {
    this.playerVersionService.updatePlayerVersion(parseInt(this.versionControl.value))
      .subscribe(() => this.versionControl.disable());
  }

}
