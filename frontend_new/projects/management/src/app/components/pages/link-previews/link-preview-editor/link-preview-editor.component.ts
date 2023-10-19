import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {DetailedLinkPreview} from "../../../../_interfaces/detailed-link-preview";
import {ListItem} from "vmms-common";
import {LinkPreviewService} from "../../../../_services/link-preview.service";
import {ClientService} from "../../../../_services/client.service";

@Component({
  selector: 'app-link-preview-editor',
  templateUrl: './link-preview-editor.component.html',
  styleUrls: ['./link-preview-editor.component.scss']
})
export class LinkPreviewEditorComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private linkPreviewService = inject(LinkPreviewService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  previewId!: number;
  preview$!: Observable<DetailedLinkPreview | null>;

  programList$!: Observable<ListItem[]>;

  formGroup!: FormGroup;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.previewId = parseInt(paramMap.get('previewLinkId') || '');

        this.preview$ = of(null);

        if (this.previewId) {
          this.preview$ = this.linkPreviewService.getLinkPreview(this.previewId).pipe(shareReplay());
        }

        return this.preview$;
      }),
      tap(preview => {
        this.programList$ = this.clientService.getProgramList().pipe(shareReplay());

        this.buildForm();

        if (preview) {
          this.updateForm(preview);
        }
      })
    ).subscribe();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      name: ['', Validators.required],
      program: [null],
      expiration_date: [''],
    });
  }

  updateForm(preview: DetailedLinkPreview) {
    this.formGroup.patchValue(preview);
    this.formGroup.get('program')?.setValue({
      id: preview.program.id,
      name: preview.program.name
    });
  }

  save() {
    if (this.previewId) {
      return this.linkPreviewService.updateLinkPreview(this.previewId, {
        ...this.formGroup.value,
        program: this.formGroup.get('program')?.value?.id
      }).subscribe();
    }

    return this.linkPreviewService.createLinkPreview({
      ...this.formGroup.value,
      program: this.formGroup.get('program')?.value?.id
    }).pipe(
      tap((res) =>
        this.router.navigateByUrl(`link-previews/link-preview/${res.id}`)
      )
    ).subscribe();
  }

  discard(preview: DetailedLinkPreview) {
    this.buildForm();
    this.updateForm(preview);
  }

}
