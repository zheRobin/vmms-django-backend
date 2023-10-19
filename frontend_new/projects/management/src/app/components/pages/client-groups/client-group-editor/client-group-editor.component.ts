import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GlobalService} from "vmms-common";
import {ToastrService} from "ngx-toastr";
import {Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {DetailedClientGroup} from "../../../../_interfaces/detailed-client-group";
import {ClientGroupService} from "../../../../_services/client-group.service";
import {ClientService} from "../../../../_services/client.service";
import {Client} from "../../../../_interfaces/file-system";

@Component({
  selector: 'app-client-group-editor',
  templateUrl: './client-group-editor.component.html',
  styleUrls: ['./client-group-editor.component.scss']
})
export class ClientGroupEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private clientGroupService = inject(ClientGroupService);
  private clientService = inject(ClientService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  groupId!: number;
  group$!: Observable<DetailedClientGroup | null>;

  clientList$!: Observable<Client[]>;

  formGroup!: FormGroup;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.groupId = parseInt(paramMap.get('id') || '');

        return this.group$ = this.groupId
          ? this.clientGroupService.getClientGroup(this.groupId).pipe(shareReplay())
          : of(null);
      }),
      tap(clientGroup => {
        this.clientList$ = this.clientService.getAllClients(false, true);

        this.buildForm();

        if (clientGroup) {
          this.globalService.setCurrentItem({id: this.groupId, category: 'client-group'});
          this.updateForm(clientGroup);
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.groupId) {
      this.globalService.removeCurrentItem();
    }
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      name: ['', Validators.required],
      clients: this.formBuilder.array([]),
    });
  }

  updateForm(clientGroup: DetailedClientGroup) {
    this.formGroup.patchValue(clientGroup);
    clientGroup.clients.forEach(client => this.addClient(client))
  }

  addClient(client?: any) {
    const value = client || null;
    return (this.formGroup?.get('clients') as FormArray).push(
      this.formBuilder.control(value, Validators.required)
    );
  }

  removeClient(index: number) {
    (this.formGroup?.get('clients') as FormArray).removeAt(index);
  }

  save() {
    if (this.groupId) {
      return this.clientGroupService.updateClientGroup(
        {...this.formGroup.value, id: this.groupId}, this.groupId
      ).subscribe();
    }

    return this.clientGroupService.createClientGroup(this.formGroup.value).pipe(
      tap((res) =>
        this.router.navigateByUrl(`client-groups/client-group/${res.id}/edit`)
      )
    ).subscribe();
  }

  discard(clientGroup: DetailedClientGroup) {
    this.buildForm();
    this.updateForm(clientGroup);
    this.toastrService.success('Changes have been discarded');
  }

}
