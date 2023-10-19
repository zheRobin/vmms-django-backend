import {inject, Injectable} from '@angular/core';
import {HelperService} from "vmms-common";
import {BehaviorSubject} from "rxjs";
import {DetailedLinkPreview} from "../_interfaces/detailed-link-preview";

@Injectable({
  providedIn: 'root'
})
export class LinkPreviewCacheService {

  private helperService = inject(HelperService);

  private previews$: BehaviorSubject<DetailedLinkPreview[]> = new BehaviorSubject<DetailedLinkPreview[]>([]);

  constructor() {}

  /* PREVIEW LINK CACHED DATA */
  getCachedLinkPreviews() {
    return this.previews$.asObservable();
  }

  setCachedLinkPreviews(previews: DetailedLinkPreview[]) {
    this.previews$.next(previews);
  }

  addCachedLinkPreview(preview: DetailedLinkPreview) {
    this.previews$.next(this.helperService.sortByField([
      ...this.previews$.getValue(),
      preview
    ]));
  }

  updateCachedLinkPreview(preview: DetailedLinkPreview) {
    this.previews$.next(this.helperService.sortByField([
      ...this.previews$.getValue().filter(cachedPreview => cachedPreview.id !== preview.id),
      preview
    ]));
  }

  removeCachedLinkPreview(previewId: number) {
    this.previews$.next(
      this.previews$.getValue().filter(cachedPreview => cachedPreview.id !== previewId)
    );
  }

}
