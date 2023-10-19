import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {contentModeList} from "../../../../shared/static/content-mode-list";
import {Observable, of, shareReplay, Subscription, switchMap, tap} from "rxjs";
import {PlaylistService} from "../../../../_services/playlist.service";
import {Category, Folder, Genre, Preview, Tag} from "../../../../_interfaces/file-system";
import {
  DetailedPlaylist,
  PlaylistDependents,
  PlaylistFilter,
} from "../../../../_interfaces/detailed-playlist";
import {ToastrService} from "ngx-toastr";
import {GlobalService, ListItem} from "vmms-common";

@Component({
  selector: 'app-playlist-editor',
  templateUrl: './playlist-editor.component.html',
  styleUrls: ['./playlist-editor.component.scss']
})
export class PlaylistEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private playlistService = inject(PlaylistService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  playlistId!: number;
  playlist$!: Observable<DetailedPlaylist | null>;
  playlistDependents$!: Observable<PlaylistDependents | null>;

  contentModeList: ListItem[] = contentModeList;
  folderList$!: Observable<Folder[]>;
  filterList$!: Observable<ListItem[][]>;
  tagList$!: Observable<Tag[]>;
  excludedTagList: ListItem[] = [];
  categoryList$!: Observable<Category[]>;

  formGroup!: FormGroup;
  formChangesSub!: Subscription;

  preview$!: Observable<Preview>;
  previewIsLoading: boolean = false;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.playlistId = parseInt(paramMap.get('playlistId') || '');

        this.playlist$ = this.playlistDependents$ = of(null);

        if (this.playlistId) {
          this.playlist$ = this.playlistService.getPlaylist(this.playlistId).pipe(shareReplay());
          this.playlistDependents$ = this.playlistService.getPlaylistDependents(this.playlistId).pipe(shareReplay());
        }

        return this.playlist$;
      }),
      tap((playlist) => {
        this.folderList$ = this.playlistService.getAllPlaylistFolders();
        this.filterList$ = this.playlistService.getFilterList().pipe(shareReplay());
        this.tagList$ = this.playlistService.getTagList().pipe(shareReplay());
        this.categoryList$ = this.playlistService.getCategoryStructure();

        this.buildForm();

        if (playlist) {
          this.globalService.setCurrentItem({id: this.playlistId, category: 'playlist'});
          this.updateForm(playlist);
        } else {
          this.addDefaultFilter();
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.formChangesSub?.unsubscribe();
    if (this.playlistId) {
      this.globalService.removeCurrentItem();
    }
  }

  uploadCover(event: File) {
    this.playlistService.uploadPlaylistCover(event).pipe(
      tap((url: string) => this.formGroup.get('cover')?.setValue(url))
    ).subscribe();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{ value: null, disabled: true}],
      name: ['', Validators.required],
      color: ['#7bd148', Validators.required],
      cover: [null],
      parent: [null],
      contentMode: [null, Validators.required],

      filters: this.formBuilder.array([]),
      includedTags: [[]],
      excludedTags: [[]],
      genres: [[]],

      songs: [[]],

      notes: ['']
    });

    this.formChangesSub = this.formGroup.valueChanges.subscribe(res => {
      this.excludedTagList = [...res.includedTags, ...res.excludedTags];
    });
  }

  updateForm(playlist: DetailedPlaylist) {
    this.formGroup.patchValue(playlist);
    this.formGroup.get('contentMode')?.setValue(playlist.content_mode.toString());
    this.formGroup.get('contentMode')?.disable();
    playlist.filters.forEach((filter: PlaylistFilter) => this.addFilter(filter.field, filter.word, filter.value));
    this.formGroup.get('includedTags')?.setValue(
      playlist.include_tags ? playlist.include_tags.split(',').map((tag: string) => parseInt(tag)) : []
    );
    this.formGroup.get('excludedTags')?.setValue(
      playlist.exclude_tags ? playlist.exclude_tags.split(',').map((tag: string) => parseInt(tag)) : []
    );
    this.formGroup.get('genres')?.setValue(
      playlist.genres ? playlist.genres.split(',').map((tag: string) => parseInt(tag)) : []
    );
  }

  addFilter(field: string, word: string, value: string) {
    const filtersControl = this.formGroup.get('filters') as FormArray;
    if (field && word && value) {
      const existedFilter = filtersControl.value
        .find((control: { field: string, word: string, value: string }) =>
          control.field === field && control.word === word
        );
      if (existedFilter) {
        return existedFilter.value.push(value);
      }
    }
    return (this.formGroup.get('filters') as FormArray).push(
      this.formBuilder.group({ field: [field], word: [word], value: [[value]] })
    );
  }

  addDefaultFilter() {
    this.addFilter('Season', 'is not', '4');
    this.addFilter('Language', 'is', '2');
  }

  removeFilter(index: number) {
    (this.formGroup.get('filters') as FormArray).removeAt(index);
  }

  save() {
    const playlistForm = this.getPlaylistDataForPayload();

    if (!this.playlistId) {
      return this.playlistService.createPlaylist(playlistForm)
        .subscribe((playlist: DetailedPlaylist) => {
          this.router.navigateByUrl(`/playlists/playlist/${playlist.id}`);
        });
    }

    return this.playlistService.updatePlaylist(playlistForm, this.playlistId)
      .subscribe((playlist: DetailedPlaylist) => {
        this.playlist$ = this.playlistService.getPlaylist(this.playlistId).pipe(shareReplay());
        this.buildForm();
        this.updateForm(playlist);
      });
  }

  discard(playlist: DetailedPlaylist) {
    this.buildForm();
    this.updateForm(playlist);
    this.toastrService.success('Changes have been discarded');
  }

  preview(playlist: DetailedPlaylist) {
    this.previewIsLoading = true;
    this.preview$ = this.playlistService.getPlaylistPreview({
      content_mode: playlist.content_mode,
      exclude_tags: playlist.exclude_tags,
      filters: playlist.filters,
      genres: playlist.genres,
      include_tags: playlist.include_tags,
      per_page: 10000
    }).pipe(tap(() => this.previewIsLoading = false));
  }

  getPlaylistDataForPayload() {
    const filters = this.formGroup.get('filters')?.value
      ?.map((filter: { field: string, word: string, value: string[] }) =>
        filter.value.map(value => {
          return { field: filter.field, word: filter.word, value: value };
        })
      ).flat();

    const playlistForm = {
      ...this.formGroup.value,
      content_mode: parseInt(this.formGroup.get('contentMode')?.value),
      filters: filters,
      include_tags: this.formGroup.get('includedTags')?.value?.join(','),
      exclude_tags: this.formGroup.get('excludedTags')?.value?.join(','),
      genres: this.formGroup.get('genres')?.value?.map((genre: Genre) => genre.id).join(','),
    };

    delete playlistForm.contentMode;
    delete playlistForm.includedTags;
    delete playlistForm.excludedTags;

    return playlistForm;
  }

}
