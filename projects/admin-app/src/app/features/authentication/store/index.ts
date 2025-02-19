// etat a creer
import {AuthenticationUser} from "../models/authentication-user";
import {signalStore, withState} from "@ngrx/signals";

export interface AuthenticationState {
  user: AuthenticationUser | null | undefined;
  isLoading: boolean;
}

// valeur initiale
const initialValue: AuthenticationState = {
  user: undefined,
  isLoading: false
}


// reducer / store ...
export const AuthenticationStore= signalStore(
  { providedIn: 'root' },
  withState(initialValue)
)
