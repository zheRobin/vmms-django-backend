import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { PlayerComponent } from './components/player/player.component';
import {apiPrefixInterceptorProvider} from "./_interceptors/api-prefix.interceptor";
import {ToastrModule} from "ngx-toastr";
import {VmmsSharedModule} from "vmms-common";

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    VmmsSharedModule,
    ToastrModule.forRoot({
      timeOut: 1500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    apiPrefixInterceptorProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
