import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {SearchInfrastructure} from "../services/search.infrastructure";

export interface SearchState {
  article: { url: string; image_url: string }[];
  isLoading: boolean;
}

export type SearchType = {
  cptSearchArticle: number,
  url?: string
}
export enum CathegoriesBlog {
  ARBRE = "arbre",
  ECOLOGIE = "écologie",
  FLEUR = "fleur",
  JARDIN = "jardin",
  NATURE = "nature",
  PLANTE = "plante",
  POTAGER = "potager",
  FAUNE = "faune"
}

// valeur initiale
const initialValue: SearchState = {
  article: [],
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
      searchArticleValideStore: rxMethod<SearchType>(
        pipe(
          tap(()=> updateState(store, '[search] update loading', {isLoading: true})    ),
          concatMap(input => {
            return infra.searchArticleValideInfra(input.cptSearchArticle).pipe(
              tapResponse({
                next: articles => patchState(store, { article: articles, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      )
    }
  ))
)
