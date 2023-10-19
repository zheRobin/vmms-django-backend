import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {GlobalService, ListItem} from "vmms-common";
import {ClientService} from "../../../../_services/client.service";
import {ClientFilter, DetailedClient} from "../../../../_interfaces/detailed-client";
import {Folder} from "../../../../_interfaces/file-system";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-client-editor',
  templateUrl: './client-editor.component.html',
  styleUrls: ['./client-editor.component.scss']
})
export class ClientEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private clientService = inject(ClientService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  clientId!: number;
  client$!: Observable<DetailedClient | null>;

  folderList$!: Observable<Folder[]>;
  filterList$!: Observable<ListItem[][]>;
  programList$!: Observable<ListItem[]>;
  promotionList$!: Observable<any>;

  formGroup: FormGroup | null = null;

  showWorkingHours: boolean = false;
  week: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.clientId = parseInt(paramMap.get('clientId') || '');

        this.formGroup = null;
        this.client$ = of(null);

        if (this.clientId) {
          this.client$ = this.clientService.getClient(this.clientId).pipe(shareReplay());
        }

        return this.client$;
      }),
      tap(client => {
        this.folderList$ = this.clientService.getAllClientFolders();
        this.filterList$ = this.clientService.getFilterList().pipe(shareReplay());
        this.programList$ = this.clientService.getProgramList().pipe(shareReplay());
        this.promotionList$ = this.clientService.getPromotionList().pipe(shareReplay());

        this.buildForm();

        if (client) {
          this.globalService.setCurrentItem({id: this.clientId, category: 'client'});
          this.updateForm(client);
        } else {
          this.addDefaultFilter();
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.clientId) {
      this.globalService.removeCurrentItem();
    }
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{ value: null, disabled: true}],
      name: ['', Validators.required],
      parent: [null],

      basic_content: [null],

      filters: this.formBuilder.array([]),

      contents: this.formBuilder.array([]),

      workingHours: this.formBuilder.array([]),

      promotions: this.formBuilder.array([]),

      api_key: [{value: '', disabled: true}],
      secret_login_key: [{value: '', disabled: true}],
      remote_volume_control_enabled: [false],
    });
  }

  updateForm(client: DetailedClient) {
    this.formGroup?.patchValue(client);
    this.formGroup?.get('basic_content')?.setValue(client.basic_content.object);
    client.filters.forEach((filter: ClientFilter) => this.addFilter(filter.field, filter.word, filter.value));
    this.week.forEach((_, index) => this.addContent(client, index));
    this.week.forEach((_, index) => this.addWorkingHours(client, index));
    this.formGroup?.get('secret_login_key')?.setValue(
      `${environment.clientUrl}/secret/${this.formGroup?.get('secret_login_key')?.value}`
    );
  }

  addFilter(field: string, word: string, value: string) {
    const filtersControl = this.formGroup?.get('filters') as FormArray;
    if (field && word && value) {
      const existedFilter = filtersControl.value
        .find((control: { field: string, word: string, value: string }) =>
          control.field === field && control.word === word
        );
      if (existedFilter) {
        return existedFilter.value.push(value);
      }
    }
    return (this.formGroup?.get('filters') as FormArray).push(
      this.formBuilder.group({ field: [field], word: [word], value: [[value]] })
    );
  }

  addDefaultFilter() {
    this.addFilter('Artist', 'is not', 'Sade');
  }

  removeFilter(index: number) {
    (this.formGroup?.get('filters') as FormArray).removeAt(index);
  }

  addContent(client: DetailedClient, index: number) {
    (this.formGroup?.get('contents') as FormArray).push(
      this.formBuilder.control(client.contents[index]?.content.object, Validators.required)
    );
  }

  addWorkingHours(client: DetailedClient, index: number) {
    const enabled = client[`${this.week[index].toLowerCase()}_enabled`];
    const openingTime = client[`${this.week[index].toLowerCase()}_open`]?.split(':') || [];
    const closingTime = client[`${this.week[index].toLowerCase()}_close`]?.split(':') || [];

    (this.formGroup?.get('workingHours') as FormArray).push(
      this.formBuilder.group({
        open: [enabled],
        openingHours: [{ value: openingTime[0] ? openingTime[0] : null, disabled: !enabled }],
        openingMinutes: [{ value: openingTime[1] ? openingTime[1] : null, disabled: !enabled }],
        closingHours: [{ value: closingTime[0] ? closingTime[0] : null, disabled: !enabled }],
        closingMinutes: [{ value: closingTime[1] ? closingTime[1] : null, disabled: !enabled }],
      })
    );

    if (!this.showWorkingHours && enabled) {
      this.showWorkingHours = true;
    }
  }

  resetWorkingHours(checked: boolean) {
    this.showWorkingHours = checked;
    (this.formGroup?.get('workingHours') as FormArray).controls.forEach(form => {
      form.reset();
      form.get('openingHours')?.disable();
      form.get('openingMinutes')?.disable();
      form.get('closingHours')?.disable();
      form.get('closingMinutes')?.disable();
    })
  }

  addPromotion(id?: number) {
    const value = id || null;
    return (this.formGroup?.get('promotions') as FormArray).push(
      this.formBuilder.control(value, Validators.required)
    );
  }

  removePromotion(index: number) {
    (this.formGroup?.get('promotions') as FormArray).removeAt(index);
  }

  save() {
    const clientForm = this.getClientDataForPayload();

    if (!this.clientId) {
      return this.clientService.createClient(clientForm)
        .subscribe((client: DetailedClient) => {
          this.router.navigateByUrl(`/clients/client/${client.id}`);
        });
    }

    return this.clientService.updateClient(clientForm, this.clientId)
      .subscribe((client: DetailedClient) => {
        this.client$ = this.clientService.getClient(this.clientId).pipe(shareReplay());
        this.buildForm();
        this.updateForm(client);
      });
  }

  getClientDataForPayload() {
    const clientForm = this.formGroup?.value;

    const workingHours = (this.formGroup?.get('workingHours') as FormArray).controls as FormGroup[];

    if (workingHours.length) {
      Object.assign(clientForm, this.week.map((day, index) => {
        return {
          [`${day.toLowerCase()}_enabled`]: workingHours[index].get('open')?.value || false,
          [`${day.toLowerCase()}_open`]: this.getOpeningHours(workingHours[index]),
          [`${day.toLowerCase()}_close`]: this.getClosingHours(workingHours[index]),
        };
      }).flat().reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {}));
    }

    clientForm.basic_content = {
      id: `pr${clientForm.basic_content.id}`,
      object: clientForm.basic_content,
      type: 'program'
    };

    clientForm.contents = clientForm.contents
      .filter((value: any) => value)
      .map((value: any) => {
        return { content: {
            id: `pr${value.id}`,
            object: value,
            type: 'program'
          }};
      });

    clientForm.filters = clientForm.filters
      ?.map((filter: { field: string, word: string, value: string[] }) =>
        filter.value.map(value => {
          return { field: filter.field, word: filter.word, value: value };
        })
      ).flat();

    clientForm.promotions = clientForm.promotions
      .filter((promotion: any) => promotion)
      .map((promotion: any) => {
        return {
          promotion_id: promotion.id,
          promotion: promotion.name,
        }
      });

    delete clientForm.workingHours;

    return clientForm;
  }

  getOpeningHours(hoursGroup: FormGroup) {
    return hoursGroup.get('open')?.value && hoursGroup.get('openingHours')?.value && hoursGroup.get('openingMinutes')?.value
      ? `${hoursGroup.get('openingHours')?.value}:${hoursGroup.get('openingMinutes')?.value}:00` : null;
  }

  getClosingHours(hoursGroup: FormGroup) {
    return hoursGroup.get('open')?.value && hoursGroup.get('closingHours')?.value && hoursGroup.get('closingMinutes')?.value
      ? `${hoursGroup.get('closingHours')?.value}:${hoursGroup.get('closingMinutes')?.value}:00` : null;
  }

  discard(client: DetailedClient) {
    this.buildForm();
    this.updateForm(client);
    this.toastrService.success('Changes have been discarded');
  }

}
