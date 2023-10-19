import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, map, Observable, switchMap} from "rxjs";
import {Folder} from "../../../_interfaces/file-system";
import {PlaylistService} from "../../../_services/playlist.service";
import {ProgramService} from "../../../_services/program.service";
import {GlobalService, ListItem} from "vmms-common";

@Component({
  selector: 'app-folder-editor',
  templateUrl: './folder-editor.component.html',
  styleUrls: ['./folder-editor.component.scss']
})
export class FolderEditorComponent implements OnInit, OnDestroy {

  private formBuilder = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private playlistService = inject(PlaylistService);
  private programService = inject(ProgramService);
  private globalService = inject(GlobalService);

  formGroup!: FormGroup;
  currentFolder!: Folder;
  isPlaylist: boolean = false;
  folderList$!: Observable<ListItem[]>;

  ngOnInit() {
    combineLatest([this.activatedRoute.paramMap, this.activatedRoute.data]).pipe(
      map(([paramMap, data]) => {
        const id = parseInt(paramMap?.get('id') || '');
        this.globalService.setCurrentItem({id: id, category: 'folder'});
        this.isPlaylist = data['category'] === 'playlist';
        return id;
      }),
      switchMap((folderId: number) => this.isPlaylist
        ? this.playlistService.getPlaylistFolder(folderId)
        : this.programService.getProgramFolder(folderId)
      )
    ).subscribe(res => {
      this.folderList$ = (this.isPlaylist
        ? this.playlistService.getAllPlaylistFolders()
        : this.programService.getAllProgramFolders()
      ).pipe(
        map(folders => folders.map(folder => {
          return { name: folder.name, id: folder.id };
        }))
      );

      this.formGroup = this.formBuilder.group({
        name: ['', Validators.required],
        parent: [null]
      });

      if (res) {
        this.currentFolder = res;
        this.formGroup.patchValue(res);
      }
    });
  }

  ngOnDestroy() {
    this.globalService.removeCurrentItem();
  }

  save() {
    const newFolderData = {
      id: this.currentFolder.id,
      name: this.formGroup.get('name')?.value,
      parent: this.formGroup.get('parent')?.value !== 'null'
        ? this.formGroup.get('parent')?.value
        : null,
    };

    return this.isPlaylist
      ? this.playlistService.updatePlaylistFolder(this.currentFolder.id, newFolderData).subscribe()
      : this.programService.updateProgramFolder(this.currentFolder.id, newFolderData).subscribe();
  }

}
