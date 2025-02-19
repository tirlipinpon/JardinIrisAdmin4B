
import {AuthenticationUser} from "../models/authentication-user";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, pipe, tap} from "rxjs";
import {computed, inject} from "@angular/core";
import {AuthenticationInfrastructure} from "../../services/authentication.infrastructure";
import {tapResponse} from "@ngrx/operators";

// etat a creer
export interface AuthenticationState {
  user: AuthenticationUser | null | undefined;
  isLoading: boolean;
}

export type AuthenticationType = {
  login: string,
  password: string
}

// valeur initiale
const initialValue: AuthenticationState = {
  user: undefined,
  isLoading: false
}


// reducer / store ...
export const AuthenticationStore= signalStore(
  { providedIn: 'root' },
  withState(initialValue),
  withComputed(store => ({ // like slice
    isAuthenticated: computed(() => store.user() !== undefined)
  })),
  withMethods((store, infra = inject(AuthenticationInfrastructure))=> (
    {
      logIn: rxMethod<AuthenticationType>(
        pipe(
          tap(()=> patchState(store, {isLoading: true})),
          concatMap(input => {
            return infra.login(input.login, input.password).pipe(
              tapResponse({
                next: user => patchState(store, {user, isLoading: false}),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      )
    }
  ))
);
