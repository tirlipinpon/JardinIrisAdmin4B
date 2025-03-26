import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {updateState, withDevtools} from "@angular-architects/ngrx-toolkit";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, EMPTY, from, pipe, switchMap, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {SearchInfrastructure} from "../services/search.infrastructure";
import {Post} from "../../../types/post";
import {map} from "rxjs/operators";

export interface SearchState {
  articles: { url: string; image_url: string }[] | null;
  articleValid: { valid: boolean | null, url: string | null, image_url: string | null, explication:{ raisonArticle1: string | null} }
  ideaByMonth:  { id: number | null, "description": string | null } | null ;
  urlPost: string | null;
  isLoading: boolean;
  generatedArticle: string | null;
  upgradedArticle: string | null;
  formatedInHtmlArticle: string | null;
  meteo: string | null;
  post: Post | null;
  postId: number | null;
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
  articleValid: { valid: null, url: null, image_url: null, explication:{raisonArticle1: null}},
  isLoading: false,
  ideaByMonth: null,
  generatedArticle: null,
  upgradedArticle: null,
  formatedInHtmlArticle: null,
  meteo: null,
  post: {
    titre: "Le retour du soleil après une semaine pluvieuse",
    description_meteo: "Un ciel dégagé et des températures en hausse marquent cette belle journée de printemps.",
    phrase_accroche: "Enfin du soleil ! Découvrez les prévisions détaillées.",
    article: "Après une semaine de pluie, le soleil fait son grand retour sur l'ensemble du pays. Les températures atteindront les 20°C dans certaines régions. Découvrez comment ce changement de temps impacte votre quotidien et les activités à privilégier.",
    citation: "Le soleil brille pour tout le monde. - Sénèque",
    lien_url_article: null,
    image_url: null,
    categorie: "Météo",
    visite: 0,
    valid: false,
    deleted: false
  },
  urlPost: null,
  postId: null

}
export const SearchStore= signalStore(
  { providedIn: 'root' },
  withDevtools('search'),
  withState(initialValue),
  withComputed(store => ({ // like slice
    isLoading: computed(() => store.isLoading()),
    isArticlesFound: computed(() => {  const articles = store.articles();
      return articles !== null && articles.length > 0 && articles[0].url.length > 1;
    }),
    isIdeaByMonth: computed(() =>  {  const ideaByMonth = store.ideaByMonth();
      return ideaByMonth!==null && ideaByMonth.id
    }),
    getArticles: computed(() =>  store.articles()),

    getArticleValid: computed(() =>  store.articleValid()),
    isArticleValid: computed(() =>  {  const articleValid = store.articleValid();
      return articleValid!==null && articleValid.valid
    }),
    getIdeaByMonth: computed(() =>  store.ideaByMonth()),
    getGeneratedArticle: computed(() =>  store.generatedArticle()),
    isGeneratedArticle: computed(() =>  {  const generatedArticle = store.generatedArticle();
      return generatedArticle!==null && generatedArticle.length > 0
    }),
    getUpgradedArticle: computed(() =>  store.upgradedArticle()),
    isUpgradedArticle: computed(() =>  {  const upgradedArticle = store.upgradedArticle();
      return upgradedArticle!==null && upgradedArticle.length > 0
    }),
    getFormatedInHtmlArticle: computed(() =>  store.formatedInHtmlArticle()),
    isFormatedInHtmlArticle: computed(() =>  {  const formatedInHtmlArticle = store.formatedInHtmlArticle();
      return formatedInHtmlArticle!==null && formatedInHtmlArticle.length > 0
    }),
    getMeteo: computed(() =>  store.meteo()),
    isMeteo: computed(() =>  {  const meteo = store.meteo();
      return meteo!==null &&  meteo.length > 0
    }),
    getPost: computed(() =>  store.post()),
  })),
  withMethods((store, infra = inject(SearchInfrastructure))=> (
    {
      searchArticle: rxMethod<number>(
        pipe(
          tap(()=> updateState(store, '[searchArticle] update loading', {isLoading: true})    ),
          concatMap((input: number) => {
            return infra.searchArticle(input).pipe(
              tapResponse({
                next: articles => patchState(store, { articles: articles, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      selectArticle: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[searchArticle] update loading', {isLoading: true})    ),
          switchMap(() => {
            const getArticles = store.getArticles();
            if (!getArticles) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.selectArticle(getArticles).pipe(
              tapResponse({
                next: articleValid => patchState(store, { articleValid: articleValid, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      searchIdea: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[searchIdea] update loading', {isLoading: true})    ),
          switchMap(() => {
            return infra.searchIdea().pipe(
              tapResponse({
                next: idea => patchState(store, { ideaByMonth: idea, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      generateArticle: rxMethod<string | undefined>(
        pipe(
          tap(() => updateState(store, '[generateArticle] update loading', {isLoading: true})    ),
          switchMap((input?: string) => {
            let getArticleValid;
            if(input?.length) {
              getArticleValid = input
            } else {
              getArticleValid = store.getArticleValid().url;
              if (!getArticleValid) {
                patchState(store, { isLoading: false });
                return EMPTY;
              }
            }
            return infra.generateArticle(getArticleValid).pipe(
              tapResponse({
                next: generatedArticle => patchState(store, { generatedArticle: generatedArticle, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      saveUrlPost: rxMethod<string>(
        pipe(
          tap(() => updateState(store, '[saveUrlPost] update loading', {isLoading: true})),
          map((url: string) => {
            patchState(store, { urlPost: url, isLoading: false });
            return url;
          })
        )
      ),
      upgradeArticle: rxMethod<void>(
        pipe(
          tap(() => updateState(store, '[upgradeArticle] update loading', { isLoading: true })),
          switchMap(() => {
            const generatedArticle = store.getGeneratedArticle();
            if (!generatedArticle) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.upgradeArticle(generatedArticle).pipe(
              tapResponse({
                next: (upgradedArticle) => patchState(store, { upgradedArticle: upgradedArticle, isLoading: false }),
                error: () => patchState(store, { isLoading: false }),
              })
            );
          })
        )
      ),
      formatInHtmlArticle: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[formatInHtmlArticle] update loading', {isLoading: true})    ),
          switchMap(() => {
            const getUpgradedArticle = store.getUpgradedArticle();
            if (!getUpgradedArticle) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.formatInHtmlArticle(getUpgradedArticle).pipe(
              tapResponse({
                next: formatedInHtmlArticle => patchState(store, { formatedInHtmlArticle: formatedInHtmlArticle, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      checkMeteo: rxMethod<void>(
        pipe(
          tap(() => updateState(store, '[checkMeteo] update loading', { isLoading: true })),
          switchMap(() => {
            return infra.checkMeteo().pipe(
              tapResponse({
                next: (meteo) => patchState(store, { meteo: meteo, isLoading: false }),
                error: () => patchState(store, { isLoading: false }),
              })
            );
          })
        )
      ),
      savePost: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[savePost] update loading', {isLoading: true})    ),
          switchMap(() => {
            const getPost = store.getPost();
            if (!getPost) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.savePost(getPost).pipe(
              tapResponse({
                next: postId => patchState(store, { postId: postId, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      addImagesInArticle: rxMethod<void>(
        pipe(
          tap(()=> updateState(store, '[addImagesInArticle] update loading', {isLoading: true})    ),
          switchMap(() => {
            const getFormatedInHtmlArticle = store.getFormatedInHtmlArticle();
            if (!getFormatedInHtmlArticle) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.addImagesInArticle(getFormatedInHtmlArticle).pipe(
              tapResponse({
                next: formatedInHtmlArticle => patchState(store, { formatedInHtmlArticle: formatedInHtmlArticle, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
    }
  ))
)
