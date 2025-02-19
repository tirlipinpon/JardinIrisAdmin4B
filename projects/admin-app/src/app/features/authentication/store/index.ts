
import {AuthenticationUser} from "../models/authentication-user";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {pipe, tap} from "rxjs";

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
  withMethods((store)=> (
    {
      logIn: rxMethod<AuthenticationType>(
        pipe(
          tap(()=> patchState(store, {isLoading: true}))
        )
      )
    }
  ))
);
