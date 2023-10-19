import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, map, Observable, switchMap} from "rxjs";
import {GlobalService, ListItem} from "vmms-common";
import {Folder} from "../../../_interfaces/file-system";
import {ClientService} from "../../../_services/client.service";

@Component({
  selector: 'app-folder-editor',
  templateUrl: './folder-editor.component.html',
  styleUrls: ['./folder-editor.component.scss']
})
export class FolderEditorComponent implements OnInit, OnDestroy {

  private formBuilder = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private globalService = inject(GlobalService);

  formGroup!: FormGroup;
  currentFolder!: Folder;
  folderList$!: Observable<ListItem[]>;

  ngOnInit() {
    combineLatest([this.activatedRoute.paramMap, this.activatedRoute.data]).pipe(
      map(([paramMap, data]) => {
        const id = parseInt(paramMap?.get('id') || '');
        this.globalService.setCurrentItem({id: id, category: 'folder'});
        return id;
      }),
      switchMap((folderId: number) => this.clientService.getClientFolder(folderId)
      )
    ).subscribe(res => {
      this.folderList$ = this.clientService.getAllClientFolders().pipe(
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

    return this.clientService.updateClientFolder(this.currentFolder.id, newFolderData).subscribe();
  }

}
