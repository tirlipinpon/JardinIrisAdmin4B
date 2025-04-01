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
  ideaPost:  { id: number | null, "description": string | null } | null ;
  isLoading: boolean;
  post: Post | null;
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
  ideaPost: null,
  post: null,

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

    getIdeaPost: computed(() =>  store.ideaPost()),
    isIdeaPost: computed(() =>  {  const ideaPost = store.ideaPost();
      return ideaPost!==null && ideaPost.id
    }),

    getArticles: computed(() =>  store.articles()),
    getArticleValid: computed(() =>  store.articleValid()),
    isArticleValid: computed(() =>  {  const articleValid = store.articleValid();
      return articleValid!==null && articleValid.valid
    }),

    getPost: computed(() => store.post()),
    isPostId: computed(() => {
      const post = store.post();
      return post !== null && post.id;
    }),
    getPostTitle: computed(() => {
      const post = store.post();
      return post?.titre;
    }),
    isPostTitre: computed(() => {
      const post = store.post();
      return post !== null && post.titre !== undefined && post.titre !== null && post.titre !== '';
    }),

    getPostDescriptionMeteo: computed(() => {
      const post = store.post();
      return post?.description_meteo;
    }),
    isPostDescriptionMeteo: computed(() => {
      const post = store.post();
      return post !== null && post.description_meteo !== undefined && post.description_meteo !== null && post.description_meteo !== '';
    }),

    getPostPhraseAccroche: computed(() => {
      const post = store.post();
      return post?.phrase_accroche;
    }),
    isPostPhraseAccroche: computed(() => {
      const post = store.post();
      return post !== null && post.phrase_accroche !== undefined && post.phrase_accroche !== null && post.phrase_accroche !== '';
    }),

    isPostArticle: computed(() => {
      const post = store.post();
      return post !== null && post.article !== undefined && post.article !== null && post.article !== '';
    }),
    getPostArticle: computed(() => {
      const post = store.post();
      return post && post.article;
    }),

    getPostCitation: computed(() => {
      const post = store.post();
      return post && post.citation;
    }),
    isPostCitation: computed(() => {
      const post = store.post();
      return post !== null && post.citation !== undefined && post.citation !== null && post.citation !== '';
    }),

    getPostMeteo: computed(() => {
      const post = store.post();
      return post && post.meteo;
    }),
    isPostMeteo: computed(() => {
      const post = store.post();
      return post !== null && post.meteo !== undefined && post.meteo !== null && post.meteo !== '';
    }),

    isPostLienUrlArticle: computed(() => {
      const post = store.post();
      return post !== null && post.lien_url_article !== undefined && post.lien_url_article !== null && post.lien_url_article.lien1 !== '';
    }),


    getPostImageUrl: computed(() => {
      const post = store.post();
      return post && post.image_url;
    }),
    isPostImageUrl: computed(() => {
      const post = store.post();
      return post !== null && post.image_url !== undefined && post.image_url !== null && post.image_url !== '';
    }),


    getPostCategorie: computed(() => {
      const post = store.post();
      return post && post.categorie;
    }),
    isPostCategorie: computed(() => {
      const post = store.post();
      return post !== null && post.categorie !== undefined && post.categorie !== null && post.categorie !== '';
    }),


    isPostValid: computed(() => {
      const post = store.post();
      return post !== null && post.valid === true;
    }),

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
                next: idea => patchState(store, { ideaPost: idea, isLoading: false }),
                error: error => patchState(store, {isLoading: false})
              })
            )
          })
        )
      ),
      generateArticle: rxMethod<string | undefined>(
        pipe(
          tap(() => updateState(store, '[generateArticle] update loading', {isLoading: true})),
          switchMap((input?: string) => {
            // Fonction pour traiter la génération d'article avec n'importe quelle source
            const processGeneration = (source: string) => {
              return infra.generateArticle(source).pipe(
                tapResponse({
                  next: post => patchState(store, { post, isLoading: false }),
                  error: error => patchState(store, {isLoading: false})
                })
              );
            };
            if (input?.length) { return processGeneration(input); }
            const articleValid = store.getArticleValid();
            if (articleValid.valid && articleValid.url) { return processGeneration(articleValid.url); }
            const ideaPost = store.getIdeaPost();
            if (ideaPost?.id !== null && ideaPost?.description) { return processGeneration(ideaPost.description); }
            patchState(store, { isLoading: false });
            return EMPTY;
          })
        )
      ),
      saveUrlPost: rxMethod<string>(
        pipe(
          tap(() => updateState(store, '[saveUrlPost] update loading', {isLoading: true})),
          map((url: string) => {
            const currentPost = store.post();
            const updatedPost = currentPost ? { ...currentPost, lien_url_article:  { lien1: url } } : { lien_url_article:  { lien1: url } };
            patchState(store, {
              post: updatedPost,
              isLoading: false
            });
            return url;
          })
        )
      ),
      upgradeArticle: rxMethod<void>(
        pipe(
          tap(() => updateState(store, '[upgradeArticle] update loading', { isLoading: true })),
          switchMap(() => {
            const generatedArticle = store.getPostArticle();
            if (!generatedArticle) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }
            return infra.upgradeArticle(generatedArticle).pipe(
              tapResponse({
                next: (upgradedArticle) => patchState(store, {
                  post: { ...store.post(), article: upgradedArticle },
                  isLoading: false }),
                error: () => patchState(store, { isLoading: false }),
              })
            );
          })
        )
      ),
      // checkMeteo: rxMethod<void>(
      //   pipe(
      //     tap(() => updateState(store, '[checkMeteo] update loading', { isLoading: true })),
      //     switchMap(() => {
      //       return infra.checkMeteo().pipe(
      //         tapResponse({
      //           next: (meteo) => patchState(store, { post: meteo, isLoading: false }),
      //           error: () => patchState(store, { isLoading: false }),
      //         })
      //       );
      //     })
      //   )
      // ),
      // savePost: rxMethod<void>(
      //   pipe(
      //     tap(()=> updateState(store, '[savePost] update loading', {isLoading: true})    ),
      //     switchMap(() => {
      //       const getPost = store.getPost();
      //       if (!getPost) {
      //         patchState(store, { isLoading: false });
      //         return EMPTY;
      //       }
      //       return infra.savePost(getPost).pipe(
      //         tapResponse({
      //           next: post => patchState(store, { postId: post.id, isLoading: false }),
      //           error: error => patchState(store, {isLoading: false})
      //         })
      //       )
      //     })
      //   )
      // ),
      // updateIdeaPost: rxMethod<void>(
      //   pipe(
      //     tap(()=> updateState(store, '[updateIdeaPost] update loading', {isLoading: true})    ),
      //     switchMap(() => {
      //       const ideaPost = store.getIdeaPost();
      //       const postId = store.getPostId();
      //       const isValid = ideaPost && ideaPost.id !== null && postId !== null;
      //       if (!isValid) { patchState(store, { isLoading: false }); return EMPTY; }
      //       return infra.updateIdeaPost(ideaPost.id as number, postId as number).pipe(
      //         tapResponse({
      //           next: ideaPost => patchState(store, {isLoading: false }),
      //           error: error => patchState(store, {isLoading: false})
      //         })
      //       )
      //     })
      //   )
      // ),
      // addImagesInArticle: rxMethod<void>(
      //   pipe(
      //     tap(()=> updateState(store, '[addImagesInArticle] update loading', {isLoading: true})    ),
      //     switchMap(() => {
      //       const getPost = store.getPostArticle();
      //       if (!getPost || !getPost.length) { patchState(store, { isLoading: false }); return EMPTY; }
      //       const getPostId = store.getPostId();
      //       if (!getPostId) { patchState(store, { isLoading: false }); return EMPTY; }
      //       return infra.addImagesInArticle(getPost, getPostId).pipe(
      //         tapResponse({
      //           next: data => patchState(store, { isLoading: false }),
      //           error: error => patchState(store, {isLoading: false})
      //         })
      //       )
      //     })
      //   )
      // ),
    }
  ))
)
