import { Injectable, inject } from '@angular/core';
import { PostStore } from '../../../edit/store';
import { SearchInfrastructure } from '../../../../shared/search-infrastructure/search.infrastructure';
import { PostImageInjectorService } from '../post-image-injector/post-image-injector.service';
import { Post } from '../../../../types/post';
import { postToDatabase } from '../../../../utils/post-to-database';
import { Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { patchState } from '@ngrx/signals';

@Injectable({
  providedIn: 'root'
})
export class PostValidationService {
  private readonly store = inject(PostStore);
  private readonly searchInfra = inject(SearchInfrastructure);
  private readonly imageInjector = inject(PostImageInjectorService);

  /**
   * Valide un post en gérant le traitement des images et l'injection
   */
  validatePost(postId: number): Observable<boolean> {
    const post = this.getPostById(postId);
    if (!post) {
      return throwError(() => new Error(`Post avec l'id ${postId} introuvable`));
    }

    return this.processPostValidation(post);
  }

  private getPostById(postId: number): Post | null {
    const posts = this.store.post();
    return posts?.find((p: Post) => p.id === postId) || null;
  }

  private processPostValidation(post: Post): Observable<boolean> {
    const needsImageProcessing = this.needsImageProcessing(post);
    
    if (needsImageProcessing) {
      return this.processImagesAndValidate(post);
    } else {
      return this.injectImagesAndValidate(post);
    }
  }

  private needsImageProcessing(post: Post): boolean {
    const hasChangedImages = post.images_chapitres?.some((img: any) => img.changed === true) || false;
    const hasExternalImage = this.isExternalImage(post.image_url);
    return hasChangedImages || hasExternalImage;
  }

  private isExternalImage(imageUrl?: string): boolean {
    if (!imageUrl) return false;
    return !imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co') &&
           (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
  }

  private processImagesAndValidate(post: Post): Observable<boolean> {
    const imagesChapitres = post.images_chapitres || [];
    const imageUrl = post.image_url || '';
    const isExternalImage = this.isExternalImage(imageUrl);

    return this.searchInfra.processPostImages(post.id!, imagesChapitres, imageUrl, isExternalImage).pipe(
      switchMap(success => {
        if (!success) {
          return throwError(() => new Error('Échec du traitement des images'));
        }
        return this.injectImagesAndValidate(post);
      }),
      catchError(error => {
        console.error('[PostValidationService] Erreur lors du traitement des images:', error);
        return throwError(() => error);
      })
    );
  }

  private injectImagesAndValidate(post: Post): Observable<boolean> {
    const updatedArticle = this.imageInjector.injectImagesIntoPost(
      post.id!, 
      post.article || '', 
      post.images_chapitres || []
    );

    if (updatedArticle === post.article) {
      // Aucune modification nécessaire, validation directe
      this.store.validPost(post.id!);
      return of(true);
    }

    // Mettre à jour le post avec le nouvel article
    const updatedPost = { ...post, article: updatedArticle };
    
    return this.updatePostAndValidate(updatedPost);
  }

  private updatePostAndValidate(post: Post): Observable<boolean> {
    // Sauvegarder l'état précédent du store pour rollback en cas d'erreur
    const previousPosts = this.store.post();
    
    // 1. Mettre à jour le store AVANT la sauvegarde
    this.updateStoreWithPost(post);
    
    // 2. Convertir le Post en PostDatabase pour la sauvegarde
    const postDatabase = postToDatabase(post);
    
    return this.searchInfra.setPost(postDatabase).pipe(
      switchMap(() => {
        // 3. Valider le post après sauvegarde réussie
        this.store.validPost(post.id!);
        return of(true);
      }),
      catchError(error => {
        console.error('[PostValidationService] Erreur lors de la mise à jour du post:', error);
        // Restaurer l'état précédent du store en cas d'erreur
        if (previousPosts) {
          patchState(this.store as any, { post: previousPosts });
          console.log('[PostValidationService] Store restauré à l\'état précédent');
        }
        return throwError(() => error);
      })
    );
  }

  private updateStoreWithPost(updatedPost: Post): void {
    const currentPosts = this.store.post();
    if (currentPosts) {
      const updatedPosts = currentPosts.map((p: Post) => p.id === updatedPost.id ? updatedPost : p);
      // Utiliser patchState pour mettre à jour le store
      patchState(this.store as any, { post: updatedPosts });
    }
  }
}
