import {Component, inject, Input, OnInit} from '@angular/core';
import {FileSystem, Folder} from "../../../_interfaces/file-system";
import {Router} from "@angular/router";
import {playlistPrefixList} from "../../static/playlist-prefix-list";
import {Observable, shareReplay, tap} from "rxjs";
import {GlobalService, SelectedItem} from "vmms-common";
import {ClientService} from "../../../_services/client.service";

@Component({
  selector: 'app-folder-tree',
  templateUrl: './folder-tree.component.html',
  styleUrls: ['./folder-tree.component.scss'],
})
export class FolderTreeComponent implements OnInit {

  private router= inject(Router);
  private globalService = inject(GlobalService);
  private clientService = inject(ClientService);

  @Input() fullFileSystem: FileSystem | null = null;
  @Input() fileSystemSlice: FileSystem | null = null;
  @Input() itemCategory: 'client' | 'schedule' | 'master-schedule' = 'client';
  @Input() search: string = '';
  openedFolder$!: Observable<number | null>;

  currentItem$!: Observable<SelectedItem | null>;
  playlistPrefixList = playlistPrefixList;

  ngOnInit() {
    this.currentItem$ = this.globalService.getCurrentItem().pipe(
      tap((res: SelectedItem | null) => res ? this.setSelectedItem(res) : null),
      shareReplay()
    );
    this.openedFolder$ = this.globalService.getOpenedFolder();
  }

  openFolder(folder: Folder, type: 'folder') {
    if (this.globalService.isEqual(folder)) {
      return folder.parent
        ? this.globalService.setOpenedFolder({ id: folder.parent, type: 'folder' })
        : this.globalService.removeOpenedFolder();
    }
    return this.globalService.setOpenedFolder({ id: folder.id, type: type });
  }

  select(itemId: number, target: 'folder' | 'client' | 'schedule' | 'master-schedule') {
    if (this.itemCategory === 'schedule' && target === 'folder') {
      return;
    }
    if (this.itemCategory === 'master-schedule') {
      return;
    }
    this.globalService.setCurrentItem({id: itemId, category: target === 'folder' ? target : 'client'});
    return this.router.navigateByUrl(`${this.itemCategory}s/${target}/${itemId}`);
  }

  setSelectedItem(item: SelectedItem | null) {
    const items = [
      ...this.fullFileSystem?.folders.map(folder => folder) || [],
      ...this.fullFileSystem?.items?.map((item: any) => item) || [],
    ];

    const currentItem = this.findItem(items, item?.id || null, item?.category);

    if (currentItem && (currentItem?.parent || currentItem?.program) && !this.globalService.getOpenedFolderValue()) {
      const parentId = currentItem?.parent;
      this.globalService.setOpenedFolder(this.findItem(items, parentId));
    }

  }

  findItem(items: any[], itemId: number | null, itemCategory?: string): any {
    if (!items?.length) {
      return null;
    }

    const item = items?.find(item =>
      (item?.id === itemId) && (itemCategory ? item?.type === itemCategory : true)
    );

    if (!item) {
      return this.findItem(
        items?.map(item => [...item?.folders || [], ...item?.clients || []])
          .filter(item => item.length).flat() || [],
        itemId,
        itemCategory
      );
    }

    return item;
  }

  enableMasterSchedule(id: number, value: boolean) {
    this.clientService.enableMasterSchedule(value, id).subscribe();
  }

}
