import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import {ReactiveFormsModule} from "@angular/forms";
import { AuthComponent } from './auth.component';
import {RouterOutlet} from "@angular/router";
import {AuthRoutingModule} from "./auth-routing.module";
import {AngularMaterialModule} from "vmms-common";

@NgModule({
  declarations: [
    LoginComponent,
    AuthComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    AuthRoutingModule,
    AngularMaterialModule,
  ]
})
export class AuthModule { }
