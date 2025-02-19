import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {SearchInfrastructure} from "../services/search.infrastructure";

export interface SearchState {
  article: string | undefined;
  isLoading: boolean;
}

export type SearchType = {
  url: string
}

// valeur initiale
const initialValue: SearchState = {
  article: undefined,
  isLoading: false
}
export const SearchStore= signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed(store => ({ // like slice
    isSearching: computed(() => store.isLoading())
  })),
  withMethods((store, infra = inject(SearchInfrastructure))=> (
    {
      search: rxMethod<SearchType>(
        pipe(
          tap(()=>  {
            console.log('search')
            return updateState(store, '[search] update loading', {isLoading: true})
          }),
          concatMap(input => {
            return infra.search(input.url).pipe(
              tapResponse({
                next: article => patchState(store, {article, isLoading: false}),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      )
    }
  ))
)
