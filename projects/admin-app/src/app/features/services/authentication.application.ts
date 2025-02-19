import {effect, inject, Injectable, Signal} from "@angular/core";
import {AuthenticationStore} from "../authentication/store";
import {Router} from "@angular/router";

@Injectable({providedIn: 'root'})
export class AuthenticationApplication {
  private readonly store = inject(AuthenticationStore);

  private constructor(private router: Router) {
  }
  private redirectToLoginEffect = effect(() => {
    // Si je suis authentifié, je pars vers la page d'accueil
    if(this.store.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  });

  /**
   *
   * @param login
   * @param password
   */
  login(login: string, password: string) {
    this.store.logIn({ login, password });
  }

  /**
   *
   */
  get isLoading(): Signal<boolean> {
    return this.store.isLoading;
  }

  get isAuthenticated(): any {
    return this.store.isAuthenticated;
  }
}
