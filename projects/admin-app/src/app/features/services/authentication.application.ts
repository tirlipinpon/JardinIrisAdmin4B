import {inject, Injectable} from "@angular/core";
import {AuthenticationStore} from "../authentication/store";

@Injectable({providedIn: 'root'})
export class AuthenticationApplication {
  private readonly store = inject(AuthenticationStore);
  constructor() {
  }
  login(login: string, password: string) {
    // call api
   this.store.logIn({login, password})
    // store.dispatch
  }
}
