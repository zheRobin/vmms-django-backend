import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {apiPrefixInterceptorProvider} from "./_interceptors/api-prefix.interceptor";
import {HttpClientModule} from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {apiHeaderInterceptorProvider} from "./_interceptors/api-header.interceptor";
import {ToastrModule} from "ngx-toastr";
import {apiErrorInterceptorProvider} from "./_interceptors/api-error.interceptor";
import {VmmsSharedModule} from "vmms-common";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    VmmsSharedModule,
    ToastrModule.forRoot({
      timeOut: 1500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    apiPrefixInterceptorProvider,
    apiHeaderInterceptorProvider,
    apiErrorInterceptorProvider,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
