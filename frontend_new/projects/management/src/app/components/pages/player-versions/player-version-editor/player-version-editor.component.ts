import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GlobalService} from "vmms-common";
import {PlayerVersionService} from "../../../../_services/player-version.service";
import {Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {PlayerVersion} from "../../../../_interfaces/player-version";

@Component({
  selector: 'app-player-version-editor',
  templateUrl: './player-version-editor.component.html',
  styleUrls: ['./player-version-editor.component.scss']
})
export class PlayerVersionEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private playerVersionService = inject(PlayerVersionService);
  private router = inject(Router);

  versionId!: number;
  version$!: Observable<PlayerVersion | null>;

  formGroup!: FormGroup;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.versionId = parseInt(paramMap.get('id') || '');

        return this.version$ = this.versionId
          ? this.playerVersionService.getPlayerVersion(this.versionId).pipe(shareReplay())
          : of(null);
      }),
      tap(version => {
        this.buildForm();

        if (version) {
          this.globalService.setCurrentItem({id: this.versionId, category: 'player-version'});
          this.updateForm(version);
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.versionId) {
      this.globalService.removeCurrentItem();
    }
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [null],
      version_string: ['', Validators.required],
      link: ['', Validators.required],
      current: [false],
    });
  }

  updateForm(user: PlayerVersion) {
    this.formGroup.patchValue(user);
    this.formGroup.disable();
  }

  uploadArtifact(event: File) {
    this.playerVersionService.uploadArtifact(event).pipe(
      tap((url: string) => this.formGroup.get('link')?.setValue(url))
    ).subscribe();
  }

  save() {
    this.playerVersionService.addPlayerVersion(this.formGroup.value).pipe(
      tap((res) =>
        this.router.navigateByUrl(`/player-versions/player-version/${res.id}`)
      )
    ).subscribe();
  }

}
