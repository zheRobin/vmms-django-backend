import {inject, Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse, HTTP_INTERCEPTORS
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  private toastrService = inject(ToastrService);
  private router = inject(Router);

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.statusText === 'Not Found') {
          this.toastrService.error(`Item not found`);
          this.router.navigateByUrl(this.router.url.slice(0, this.router.url.lastIndexOf('/')));
          return throwError(() => error);
        }
        Object.entries(error.error).forEach(([key, value]: [any, any]) => {
          if (typeof value[0] === 'string') {
            return this.toastrService.error(`${key}: ${value.join(', ')}`);
          }
          return value.forEach((err: any) => {
            const field = Object.entries(err)[0][0];
            const text: any = Object.entries(err)[0][1];
            this.toastrService.error(`${field}: ${text.join(', ')}`);
          })
        });

        return throwError(() => error);
      })
    );
  }
}

export const apiErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiErrorInterceptor,
  multi: true
}
