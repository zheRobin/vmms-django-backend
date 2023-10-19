import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ProgramService} from "../../../../_services/program.service";
import {map, Observable, of, shareReplay, Subscription, switchMap, tap} from "rxjs";
import {Folder, Preview} from "../../../../_interfaces/file-system";
import {DetailedProgram, ProgramDependents} from "../../../../_interfaces/detailed-program";
import {PlaylistService} from "../../../../_services/playlist.service";
import {GlobalService, ListItem} from "vmms-common";

@Component({
  selector: 'app-program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.scss']
})
export class ProgramEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private programService = inject(ProgramService);
  private playlistService = inject(PlaylistService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  programId!: number;
  program$!: Observable<DetailedProgram | null>;
  programDependents$!: Observable<ProgramDependents | null>;

  folderList$!: Observable<Folder[]>;
  playlistList$!: Observable<ListItem[]>;

  formGroup!: FormGroup;
  formChangesSub!: Subscription;

  preview$!: Observable<Preview>;
  previewIsLoading: boolean = false;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.programId = parseInt(paramMap.get('programId') || '');

        this.program$ = this.programDependents$ = of(null);

        if (this.programId) {
          this.program$ = this.programService.getProgram(this.programId).pipe(shareReplay());
          this.programDependents$ = this.programService.getProgramDependents(this.programId).pipe(shareReplay())
        }

        return this.program$;
      }),
      tap((program) => {
        this.buildForm();

        this.folderList$ = this.programService.getAllProgramFolders();
        this.playlistList$ = this.playlistService.getAllPlaylists().pipe(
          map(playlists => playlists.map(playlist => {
            return { id: playlist.id, name: playlist.name };
          })),
          shareReplay()
        );

        if (program) {
          this.globalService.setCurrentItem({id: this.programId, category: 'program'});
          this.updateForm(program);
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.formChangesSub?.unsubscribe();
    if (this.programId) {
      this.globalService.removeCurrentItem();
    }
  }

  uploadCover(event: File) {
    this.programService.uploadProgramCover(event).pipe(
      tap((url: string) => this.formGroup.get('cover')?.setValue(url))
    ).subscribe();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      name: ['', Validators.required],
      color: ['#7bd148', Validators.required],
      cover: [null],
      parent: [null],

      playlists: this.formBuilder.array([]),

      notes: ['']
    });
  }

  updateForm(program: DetailedProgram) {
    this.formGroup.patchValue(program);
    this.playlistList$.pipe(
      tap(playlists => {
        program.playlists.forEach(playlistData => {
          const searchedPlaylist = playlists.find(playlist => playlist.id === playlistData.playlist);
          if (searchedPlaylist) {
            this.addPlaylist({ id: searchedPlaylist.id, name: searchedPlaylist.name}, playlistData.percentage);
          }
        });
      })
    ).subscribe();
  }

  addPlaylist(playlist: ListItem | null = null, percentage: number | null = null) {
    return (this.formGroup.get('playlists') as FormArray).push(
      this.formBuilder.group({ playlist: playlist, percentage: percentage })
    );
  }

  removePlaylist(index: number) {
    (this.formGroup.get('playlists') as FormArray).removeAt(index);
  }

  save() {
    const programForm = this.getProgramDataForPayload();

    if (!this.programId) {
      return this.programService.createProgram(programForm)
        .subscribe((program: DetailedProgram) => {
          this.router.navigateByUrl(`/programs/program/${program.id}`);
        });
    }

    return this.programService.updateProgram(programForm, this.programId)
      .subscribe((program: DetailedProgram) => {
        this.program$ = this.programService.getProgram(this.programId).pipe(shareReplay());
        this.buildForm();
        this.updateForm(program);
      });
  }

  discard(program: DetailedProgram) {
    this.buildForm();
    this.updateForm(program);
    this.toastrService.success('Changes have been discarded');
  }

  preview() {
    this.previewIsLoading = true;
    this.preview$ = this.programService.getProgramPreview({
      playlistIds: (this.formGroup.get('playlists') as FormArray).value.map((playlistForm: any) => playlistForm.playlist),
      per_page: 10000
    }).pipe(tap(() => this.previewIsLoading = false));
  }

  getProgramDataForPayload() {
    return {
      ...this.formGroup.value,
      playlists: (this.formGroup.get('playlists') as FormArray).value.map((playlistForm: any) => {
        return { playlist: playlistForm?.playlist?.id, percentage: playlistForm?.percentage };
      })
    };
  }

}
