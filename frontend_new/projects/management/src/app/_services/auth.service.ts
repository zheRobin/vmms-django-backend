import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {Router} from "@angular/router";
import {User, GlobalService, TokenService} from "vmms-common";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private httpClient = inject(HttpClient);
  private tokenService = inject(TokenService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  constructor() { }

  login(username: string, password: string): Observable<{ token: string, user: User }> {
    return this.httpClient.post('/obtain-token/', {
      host: 'management',
      username: username,
      password: password,
    }).pipe(
      tap((res: any) => {
        this.tokenService.setToken(res?.token);
        this.globalService.setCurrentUser(res?.user);
        this.router.navigateByUrl('/');
      })
    );
  }

  logout() {
    return this.httpClient.get('/logout/').pipe(
      tap(() => {
        this.tokenService.clearToken();
        this.globalService.setCurrentUser({} as User);
        this.router.navigateByUrl('/auth');
      })
    );
  }

}
