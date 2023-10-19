import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DetailedLinkPreview} from "../_interfaces/detailed-link-preview";
import {map, Observable, switchMap, tap} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {LinkPreviewCacheService} from "./link-preview-cache.service";
import {HelperService} from "vmms-common";

@Injectable({
  providedIn: 'root'
})
export class LinkPreviewService {

  private httpClient = inject(HttpClient);
  private previewLinkCacheService = inject(LinkPreviewCacheService);
  private helperService = inject(HelperService);
  private toastrService = inject(ToastrService);

  constructor() { }

  getAllLinkPreviews(): Observable<DetailedLinkPreview[]> {
    return this.httpClient.get<DetailedLinkPreview[]>('/program-preview-link/').pipe(
      map(previews => this.helperService.sortByDateField(previews, 'expiration_date').reverse()),
      tap(previews => this.previewLinkCacheService.setCachedLinkPreviews(previews)),
      switchMap(() => this.previewLinkCacheService.getCachedLinkPreviews())
    );
  }

  getAllCachedLinkPreviews() {
    return this.previewLinkCacheService.getCachedLinkPreviews();
  }

  getLinkPreview(id: number): Observable<DetailedLinkPreview> {
    return this.httpClient.get<DetailedLinkPreview>(`/program-preview-link/${id}/`);
  }

  createLinkPreview(preview: Partial<DetailedLinkPreview>) {
    return this.httpClient.post<DetailedLinkPreview>('/program-preview-link/', preview).pipe(
      tap(preview => this.previewLinkCacheService.addCachedLinkPreview(preview)),
      tap(() => this.toastrService.success('Link Preview has been created'))
    );
  }

  updateLinkPreview(id: number, preview: Partial<DetailedLinkPreview>) {
    return this.httpClient.put<DetailedLinkPreview>(`/program-preview-link/${id}/`, preview).pipe(
      tap(preview => this.previewLinkCacheService.updateCachedLinkPreview(preview)),
      tap(() => this.toastrService.success('Link Preview has been updated'))
    );
  }

  deleteLinkPreview(id: number) {
    return this.httpClient.delete<void>(`/program-preview-link/${id}/`).pipe(
      tap(() => this.previewLinkCacheService.removeCachedLinkPreview(id)),
      tap(() => this.toastrService.success('Link Preview has been deleted'))
    );
  }

}
