import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../_services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  formGroup!: FormGroup;

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.authService.login(
      this.formGroup.get('username')?.value,
      this.formGroup.get('password')?.value
    ).subscribe();
  }

}
