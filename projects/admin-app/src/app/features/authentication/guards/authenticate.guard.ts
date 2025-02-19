import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {AuthenticationApplication} from "../../services/authentication.application";

export const userIsAuthenticateGuard: CanActivateFn = (
  route,
  state,
  application = inject(AuthenticationApplication),
  router = inject(Router)
) => {
  if (! application.isAuthenticated()) {
    router.navigate(['authenticate/login']);
    return false;
  }
  return application.isAuthenticated();
};
