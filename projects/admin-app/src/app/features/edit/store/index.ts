import {Post} from "../../../types/post";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {withDevtools} from "@angular-architects/ngrx-toolkit";
import {inject} from "@angular/core";
import {SearchInfrastructure} from "../../searchBar/services/search-infrastructure/search.infrastructure";
import {pipe, switchMap, tap} from "rxjs";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {tapResponse} from "@ngrx/operators";

export interface PostState  {
  post: Post[] | null;
  loading: boolean;
  error: unknown;
}

export const initialPostState: PostState = {
  post: null,
  loading: false,
  error: null
}

export const PostStore = signalStore(
  { providedIn: 'root' },
  withDevtools('post'),
  withState(initialPostState),
  withMethods((store, infra = inject(SearchInfrastructure)) => ({
    getOnePost: rxMethod<number>(
      pipe(
        tap(()=> patchState(store, {loading: true})),
        switchMap((postId) => { // get = switch et push = concat
          return infra.getOneOrManyPostForm(postId).pipe(
            tapResponse({
              next: (post) => patchState(store, {post, loading: false}),
              error: (err) => {
                patchState(store,{ loading: false, error: err})
                console.log(err)
              }
            })
          )
        })
      )
    ),
    setOnePost: rxMethod<Post>(
      pipe(
        tap(()=> patchState(store, {loading: true})),
        switchMap((post: Post) => { // get = switch et push = concat
          return infra.setPost(post).pipe(
            tapResponse({
              next: (post) => patchState(store, {loading: false}),
              error: (err) => {
                patchState(store,{ loading: false, error: err})
                console.log(err)
              }
            })
          )
        })
      )
    ),
  }))
)
