import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

  private readonly prefix: string;

  constructor() {
    this.prefix = environment.apiUrl;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!/^(http|https):/i.test(request.url)) {
      request = request.clone({ url: this.prefix + request.url });
    }

    return next.handle(request);
  }
}

export const apiPrefixInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiPrefixInterceptor,
  multi: true
}
