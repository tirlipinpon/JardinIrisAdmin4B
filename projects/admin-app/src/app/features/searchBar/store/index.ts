import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, from, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {SearchInfrastructure} from "../services/search.infrastructure";

export interface SearchState {
  articles: { url: string; image_url: string }[] | null;
  ideaByMonth: string | null;
  isLoading: boolean;
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
  articles: null,
  isLoading: false,
  ideaByMonth: null
}
export const SearchStore= signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed(store => ({ // like slice
    isSearching: computed(() => store.isLoading()),
    isArticlesFound: computed(() => { const articles = store.articles(); return articles !== null && articles.length > 0; }),
    isArticlesNull: computed(() =>  store.articles()===null),
    isIdeaByMonth: computed(() =>  store.ideaByMonth()!==null),
  })),
  withMethods((store, infra = inject(SearchInfrastructure))=> (
    {
      searchArticle: rxMethod<number>(
        pipe(
          tap(()=> updateState(store, '[searchArticle] update loading', {isLoading: true})    ),
          concatMap((input: number) => {
            return infra.searchArticle(input).pipe(
              tapResponse({
                next: articles => patchState(store, {
                  articles: articles.length ? [...articles] :  [...[]], isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      searchIdea: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[searchIdea] update loading', {isLoading: true})    ),
          concatMap(() => {
            return infra.searchIdea().pipe(
              tapResponse({
                next: idea => patchState(store, { ideaByMonth: idea, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
    }
  ))
)
