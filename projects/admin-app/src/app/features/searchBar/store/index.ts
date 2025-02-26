import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, from, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {SearchInfrastructure} from "../services/search.infrastructure";

export interface SearchState {
  articles: { url: string; image_url: string }[];
  isLoading: boolean;
  articleValide: string | null;
  articleGenerated: string | null;
  articleGeneratedDesign: string | null;
  imageUrl: string | null;
  meteo: string | null;
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
  articles: [],
  isLoading: false,
  articleValide: null,
  articleGenerated: '',
  articleGeneratedDesign: '',
  imageUrl: '',
  meteo: ''
}
export const SearchStore= signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed(store => ({ // like slice
    isSearching: computed(() => store.isLoading()),
    articlesFound: computed(() =>  store.articles().length>0),
    getArticlesFound: computed(() =>  store.articles()),
    getArticleValide: computed(() =>  store.articleValide()),
    getArticleGenerated: computed(() =>  store.articleGenerated())
  })),
  withMethods((store, infra = inject(SearchInfrastructure))=> (
    {
      searchArticle: rxMethod<SearchType>(
        pipe(
          tap(()=> updateState(store, '[searchArticle] update loading', {isLoading: true})    ),
          concatMap(input => {
            return infra.searchArticle(input.cptSearchArticle).pipe(
              tapResponse({
                next: articles => patchState(store, { articles: articles, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      searchArticleValide: rxMethod<any>(
        pipe(
          tap(()=> updateState(store, '[searchArticleValide] update loading', {isLoading: true})    ),
          concatMap((input) => {
            return from(infra.searchArticleValide(input)).pipe(
              tapResponse({
                next: articleValide => patchState(store, { articleValide: articleValide, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      generateArticle: rxMethod<any>(
        pipe(
          tap((data)=> {
            console.log('generateArticle', data)
            updateState(store, '[articleGenerated] update loading', {isLoading: true,imageUrl: data.image_url})
          }),
          concatMap((input) => {
            return from(infra.generateArticle(input.url)).pipe(
              tapResponse({
                next: articleGenerated => patchState(store, { articleGenerated: articleGenerated, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      designArticle: rxMethod<any>(
        pipe(
          tap(()=> updateState(store, '[designArticle] update loading', {isLoading: true})    ),
          concatMap((input) => {
            return from(infra.designArticleGenerated(input.article)).pipe(
              tapResponse({
                next: articleGenerated => patchState(store, { articleGeneratedDesign: articleGenerated, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      meteoArticle: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[meteoArticle] update loading', {isLoading: true})    ),
          concatMap(() => {
            return from(infra.meteoArticleGenerated()).pipe(
              tapResponse({
                next: meteo => patchState(store, { meteo: meteo, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      generateImage: rxMethod<any>(
        pipe(
          tap(()=> updateState(store, '[generateArticle] update loading', {isLoading: true})    ),
          concatMap((input) => {
            return from(infra.searchArticleValide(input)).pipe(
              tapResponse({
                next: articleValide => patchState(store, { articleValide: articleValide, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
    }
  ))
)
