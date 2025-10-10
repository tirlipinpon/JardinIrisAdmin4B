import { Post } from "../../../types/post";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { updateState, withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { SearchInfrastructure } from "../../../shared/search-infrastructure/search.infrastructure";
import { pipe, switchMap, tap } from "rxjs";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { Comment } from "../../../types/comment";
import { ImageChapitre } from "../../../types/imageChapitre";

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
  withMethods((store, infra = inject(SearchInfrastructure)) =>
    ({
    getOneOrManyPostForm: rxMethod<number | undefined>(
      pipe(tap(()=> updateState(store, '[get One Or Many Post Form] loading: true', {loading: true})),
        switchMap((postId: number | undefined) => { // get = switch et push = concat
          return infra.getOneOrManyPostForm(postId).pipe(
            tapResponse({
              next: (post) => patchState(store, {post, loading: false}),
              error: (err) => {
                patchState(store,{ loading: false, error: err})
                console.log(err)
              }
            })
          )
        }))
    ),
      getPostWithCommentsAndImages: rxMethod<{id?: number | null, orderBySelected?: string | null}>(
      pipe(tap(()=> updateState(store, '[get Post With Comments] loading: true', {loading: true})),
        switchMap((params = {}) => { // get = switch et push = concat
          const { id, orderBySelected } = params;
          return infra.getPostWithCommentsAndImages(id, orderBySelected
          ).pipe(
            tapResponse({
              next: (postsWithComments) => patchState(store, {
                post: postsWithComments, loading: false }),
              error: (err) => {
                patchState(store,{ loading: false, error: err})
                console.log(err)
              }
            })
          )
        }))
    ),
    setOnePost: rxMethod<Post>(
      pipe(tap(()=> updateState(store, '[set One Post] loading: true', {loading: true})),
        switchMap((post: Post) => { // get = switch et push = concat
          return infra.setPost(post).pipe(
            tapResponse({
              next: (post) => updateState(store, '[set One Post] update post', {
                post: store.post()?.map(p => p.id === post.id ? post : p),
                loading: false
              }),
              error: (err) => {
                patchState(store,{ loading: false, error: err})
                console.log(err)
              }
            })
          )
        }))
    ),
      deletePost: rxMethod<number>(
        pipe(tap(()=> updateState(store, '[delete Post] loading: true', {loading: true})),
          switchMap((postId: number) => {
            return infra.deletePost(postId).pipe(
              tapResponse({
                next: (post) => updateState(store, '[delete Post] delete post', {
                  post: store.post()?.map(p => p.id === post.id ? post : p),
                  loading: false
                }),
                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
      validPost: rxMethod<number>(
        pipe(tap(()=> updateState(store, '[valid Post] loading: true', {loading: true})),
          switchMap((postId: number) => {
            return infra.validPost(postId).pipe(
              tapResponse({
                next: (post) => updateState(store, '[valid Post] valid post', {
                  post: store.post()?.map(p => p.id === post.id ? post : p),
                  loading: false
                }),
                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
      deleteComment: rxMethod<number>(
        pipe(tap(()=> updateState(store, '[delete Comment] loading: true', {loading: true})),
          switchMap((id: number) => {
            return infra.deleteComment(id).pipe(
              tapResponse({
                next: (comment: Comment) => updateState(store, '[delete Post] delete comment', {
                  post: store.post()?.map(p => p.id === comment.fk_post ? {
                    ...p,
                    comments: p.comments?.map(c => c.id === comment.id ? comment : c)
                  } : p),
                  loading: false
                }),
                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
      validComment: rxMethod<number>(
        pipe(tap(()=> updateState(store, '[valid Comment] loading: true', {loading: true})),
          switchMap((id: number) => {
            return infra.validComment(id).pipe(
              tapResponse({
                next: (comment: Comment) => updateState(store, '[valid Post] valid comment', {
                  post: store.post()?.map(p => p.id === comment.fk_post ? {
                    ...p,
                    comments: p.comments?.map(c => c.id === comment.id ? comment : c)
                  } : p),
                  loading: false
                }),
                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
      editPostVideo: rxMethod<{ id: number; idYoutube: string }>(
        pipe(tap(()=> updateState(store, '[Edit Post Video] loading: true', {loading: true})),
          switchMap(({ id, idYoutube }) => {
            return infra.editPostVideo(id, idYoutube).pipe(
              tapResponse({
                next: (post: Post) => updateState(store, '[valid Post] valid comment', {
                  post: store.post()?.map(p => p.id === post.id ? { ...p, video: post.video } : p ),
                  loading: false
                }),
                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
      editImagesChapitreArticle: rxMethod<{ idImage: number; url: string; searchText: string, idPost: number}>(
        pipe(tap(()=> updateState(store, '[Edit editImages Chapitre Article] loading: true', {loading: true})),
          switchMap(({ idImage, url, searchText, idPost}) => {
            return infra.editImagesChapitreArticle(idImage, url, searchText).pipe(
              tapResponse({
                next: (image: ImageChapitre) => updateState(store, '[valid image chapter] valid', {
                  post: store.post()?.map(p => {
                    if (p.id === image.fk_post) {
                      // Mettre à jour ou ajouter l'image dans images_chapitres[]
                      const images = p.images_chapitres || [];
                      const index = images.findIndex(img => img.id === image.id);
                      if (index >= 0) {
                        // Mise à jour - marquer l'image comme changée pour upload lors de la validation
                        images[index] = { ...image, changed: true };
                      } else {
                        // Ajout
                        images.push({ ...image, changed: true });
                      }
                      return { ...p, images_chapitres: images };
                    }
                    return p;
                  }),
                  loading: false
                }),

                error: (err) => {
                  patchState(store,{ loading: false, error: err})
                  console.log(err)
                }
              })
            )
          }))
      ),
  }))
)
