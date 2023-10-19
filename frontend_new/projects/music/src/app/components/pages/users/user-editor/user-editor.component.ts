import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {User, UserService, GlobalService, ListItem} from "vmms-common";
import {userGroupList} from "../../../../shared/static/user-group-list";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private globalService = inject(GlobalService);
  private userService = inject(UserService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  userId!: number;
  user$!: Observable<User | null>;

  userGroupList: ListItem[] = userGroupList;

  formGroup!: FormGroup;

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      switchMap((paramMap: ParamMap) => {
        this.userId = parseInt(paramMap.get('id') || '');

        return this.user$ = this.userId
          ? this.userService.getUser(this.userId).pipe(shareReplay())
          : of(null);
      }),
      tap(user => {
        this.buildForm();

        if (user) {
          this.globalService.setCurrentItem({id: this.userId, category: 'user'});
          this.updateForm(user);
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.userId) {
      this.globalService.removeCurrentItem();
    }
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      username: ['', Validators.required],
      password: [''],
      group: [null, Validators.required],
    });

    if (!this.userId) {
      this.formGroup.get('password')?.setValidators(Validators.required);
    }
  }

  updateForm(user: User) {
    this.formGroup.patchValue(user);
  }

  save() {
    if (this.userId) {
      const newUserForm = {...this.formGroup.value};
      if (!newUserForm.password) {
        delete newUserForm.password;
      }
      return this.userService.updateUser(newUserForm, this.userId).subscribe();
    }
    return this.userService.createUser(this.formGroup.value).pipe(
      tap(user => this.router.navigateByUrl(`/users/user/${user.id}`))
    ).subscribe();
  }

  discard(user: User) {
    this.buildForm();
    this.updateForm(user);
    this.toastrService.success('Changes have been discarded');
  }

}
