import {inject, Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {TokenService} from "vmms-common";

@Injectable()
export class ApiHeaderInterceptor implements HttpInterceptor {

  private tokenService = inject(TokenService);

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.tokenService.getToken()) {
      request = request.clone({
        setHeaders: { 'Authorization': `Token ${this.tokenService.getToken()}` }
      });
    }

    return next.handle(request);
  }
}

export const apiHeaderInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiHeaderInterceptor,
  multi: true
}
