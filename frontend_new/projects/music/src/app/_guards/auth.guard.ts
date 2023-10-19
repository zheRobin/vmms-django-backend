import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {TokenService} from "vmms-common";

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const tokenService = inject(TokenService);

  return tokenService.getToken() ? true : router.navigate(['auth'])
};
