import { Injectable, inject } from '@angular/core';
import { PostStore } from '../../../edit/store';
import { SearchInfrastructure } from '../../../../shared/search-infrastructure/search.infrastructure';
import { PostImageInjectorService } from '../post-image-injector/post-image-injector.service';
import { ImageDiagnosticService } from '../image-diagnostic/image-diagnostic.service';
import { Post } from '../../../../types/post';
import { postToDatabase } from '../../../../utils/post-to-database';
import { Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { generateAltTextFromUrl, generateImageSrc } from '../../../../utils/supabase-image-utils';

@Injectable({
  providedIn: 'root'
})
export class PostValidationService {
  private readonly store = inject(PostStore);
  private readonly searchInfra = inject(SearchInfrastructure);
  private readonly imageInjector = inject(PostImageInjectorService);
  private readonly imageDiagnostic = inject(ImageDiagnosticService);

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
    
    console.log(`[PostValidationService.isExternalImage] Vérification URL: ${imageUrl}`);
    
    // Vérifier si l'image est externe (pas Supabase) ou non optimisée
    const isExternal = !imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co') &&
                      (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
    const isNotOptimized = !imageUrl.includes('.webp') || !imageUrl.includes('/jardin-iris-images-post/');
    
    const result = isExternal || isNotOptimized;
    console.log(`[PostValidationService.isExternalImage] Résultat: ${result} (isExternal: ${isExternal}, isNotOptimized: ${isNotOptimized})`);
    
    return result;
  }

  private processImagesAndValidate(post: Post): Observable<boolean> {
    const imagesChapitres = post.images_chapitres || [];
    const imageUrl = post.image_url || '';
    const isExternalImage = this.isExternalImage(imageUrl);

    console.log(`[PostValidationService.processImagesAndValidate] Post ${post.id}:`);
    console.log(`  - Image principale: ${imageUrl}`);
    console.log(`  - Image principale externe: ${isExternalImage}`);
    console.log(`  - Images chapitres: ${imagesChapitres.length}`);
    console.log(`  - Images changées: ${imagesChapitres.filter(img => img.changed).length}`);

    return this.searchInfra.processPostImages(post.id!, imagesChapitres, imageUrl, isExternalImage).pipe(
      switchMap(success => {
        console.log(`[PostValidationService.processImagesAndValidate] Traitement des images: ${success}`);
        
        if (!success) {
          return throwError(() => new Error('Échec du traitement des images'));
        }
        
        // Utiliser directement le post du store qui a été mis à jour en temps réel
        console.log(`[PostValidationService.processImagesAndValidate] Utilisation du post mis à jour depuis le store...`);
        const updatedPostFromStore = this.getPostById(post.id!);
        if (!updatedPostFromStore) {
          return throwError(() => new Error(`Post ${post.id} introuvable dans le store`));
        }
        
        console.log(`[PostValidationService.processImagesAndValidate] Post récupéré du store:`, {
          id: updatedPostFromStore.id,
          imagesChapitresCount: updatedPostFromStore.images_chapitres?.length || 0,
          imagesChapitres: updatedPostFromStore.images_chapitres?.map(img => ({
            id: img.id,
            chapitre_id: img.chapitre_id,
            url_Image: img.url_Image,
            changed: img.changed
          }))
        });
        
        return this.injectImagesAndValidate(updatedPostFromStore);
      }),
      catchError(error => {
        console.error('[PostValidationService] Erreur lors du traitement des images:', error);
        return throwError(() => error);
      })
    );
  }

  private injectImagesAndValidate(post: Post): Observable<boolean> {
    console.log(`[PostValidationService.injectImagesAndValidate] Début injection pour post ${post.id}`);
    
    const updatedArticle = this.imageInjector.injectImagesIntoPostForValidation(
      post.id!, 
      post.article || '', 
      post.images_chapitres || []
    );

    // Vérifier si des images ont été injectées
    const imagesInjectedCount = this.imageInjector.countInjectedImages(updatedArticle);
    const originalImagesCount = this.imageInjector.countInjectedImages(post.article || '');

    console.log(`[PostValidationService.injectImagesAndValidate] Résultats injection:`);
    console.log(`  - Images injectées: ${imagesInjectedCount}`);
    console.log(`  - Images originales: ${originalImagesCount}`);
    console.log(`  - Article modifié: ${updatedArticle !== post.article}`);

    if (updatedArticle === post.article) {
      console.log(`[PostValidationService.injectImagesAndValidate] Aucune modification, validation directe`);
      this.store.validPost(post.id!);
      return of(true);
    }

    // Vérifier que l'injection a bien fonctionné
    if (imagesInjectedCount === 0 && post.images_chapitres && post.images_chapitres.length > 0) {
      console.error(`[PostValidationService] Échec injection images post ${post.id}: ${post.images_chapitres.length} attendues, ${imagesInjectedCount} injectées`);
      return this.tryAlternativeImageInjection(post);
    }

    // Mettre à jour le post avec le nouvel article
    const updatedPost = { ...post, article: updatedArticle };
    console.log(`[PostValidationService.injectImagesAndValidate] Article mis à jour, sauvegarde en cours...`);
    return this.updatePostAndValidate(updatedPost);
  }

  private updatePostAndValidate(post: Post): Observable<boolean> {
    console.log(`[PostValidationService.updatePostAndValidate] Début sauvegarde post ${post.id}`);
    
    // Sauvegarder l'état précédent du store pour rollback en cas d'erreur
    const previousPosts = this.store.post();
    
    // 1. Mettre à jour le store AVANT la sauvegarde
    this.updateStoreWithPost(post);
    
    // 2. Convertir le Post en PostDatabase pour la sauvegarde
    const postDatabase = postToDatabase(post);
    
    console.log(`[PostValidationService.updatePostAndValidate] Post converti pour sauvegarde:`, {
      id: postDatabase.id,
      article_length: postDatabase.article?.length || 0,
      image_url: postDatabase.image_url
    });
    
    return this.searchInfra.setPost(postDatabase).pipe(
      switchMap((savedPost) => {
        console.log(`[PostValidationService.updatePostAndValidate] Post sauvegardé avec succès:`, savedPost);
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
      // Filtrer les posts undefined/null et mapper les posts valides
      const updatedPosts = currentPosts
        .filter((p: Post) => p && p.id !== undefined)
        .map((p: Post) => p.id === updatedPost.id ? updatedPost : p);
      
      // Utiliser patchState pour mettre à jour le store
      patchState(this.store as any, { post: updatedPosts });
    }
  }

  /**
   * Méthode de fallback pour l'injection d'images en cas d'échec
   * @param post - Post à traiter
   * @returns Observable avec le résultat
   */
  private tryAlternativeImageInjection(post: Post): Observable<boolean> {
    if (!post.images_chapitres || post.images_chapitres.length === 0) {
      this.store.validPost(post.id!);
      return of(true);
    }

    // Essayer une injection manuelle plus simple
    let updatedArticle = post.article || '';
    let successCount = 0;

    try {
      // Parcourir chaque image et essayer de l'injecter manuellement
      for (const image of post.images_chapitres) {
        if (!image.url_Image || !image.chapitre_id) {
          continue;
        }

        // Chercher le span correspondant au chapitre avec une regex robuste
        const spanRegex = new RegExp(`<span\\s+id=(?:["'])paragraphe-${image.chapitre_id}(?:["'])\\s*>(.*?)<\\/span>`, 'gs');
        const match = spanRegex.exec(updatedArticle);
        
        if (match) {
          const [fullMatch, content] = match;
          
          // Vérifier si l'image n'est pas déjà présente
          if (!content.includes('class="randomCropImage"')) {
            // Générer l'alt text et le src avec les nouvelles fonctions utilitaires
            const altText = generateAltTextFromUrl(image.url_Image, image.chapitre_key_word);
            const src = generateImageSrc(image.url_Image, post.id);
            
            // Construire la balise img
            const imgTag = `<img src="${src}" alt="${altText}" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async">`;
            
            // Chercher la première balise <article> et insérer l'image avant (mode fallback)
            const articlePattern = /<article>/i;
            const articleMatch = content.match(articlePattern);
            
            if (articleMatch) {
              // Injecter l'image avant la première balise <article>
              const articleIndex = content.indexOf(articleMatch[0]);
              const beforeArticle = content.substring(0, articleIndex);
              const afterArticle = content.substring(articleIndex);
              const newContent = beforeArticle + imgTag + afterArticle;
              
              // Remplacer dans l'article
              updatedArticle = updatedArticle.replace(fullMatch, fullMatch.replace(content, newContent));
              successCount++;
            } else {
              // Fallback : injecter à la fin du contenu si pas d'<article>
              const newContent = content + imgTag;
              updatedArticle = updatedArticle.replace(fullMatch, fullMatch.replace(content, newContent));
              successCount++;
            }
          } else {
            successCount++;
          }
        }
      }

      if (successCount > 0) {
        // Mettre à jour le post avec le nouvel article
        const updatedPost = { ...post, article: updatedArticle };
        return this.updatePostAndValidate(updatedPost);
      } else {
        console.error(`[PostValidationService] Échec injection fallback post ${post.id}: ${successCount}/${post.images_chapitres.length} images`);
        // Valider quand même le post sans les images
        this.store.validPost(post.id!);
        return of(true);
      }

    } catch (error) {
      console.error(`[PostValidationService] Erreur injection fallback post ${post.id}:`, error);
      // Valider quand même le post sans les images
      this.store.validPost(post.id!);
      return of(true);
    }
  }

  /**
   * Vérifie l'état des images après injection
   * @param post - Post à vérifier
   * @returns true si les images sont correctement injectées
   */
  private verifyImageInjection(post: Post): boolean {
    if (!post.article || !post.images_chapitres) {
      return true; // Pas d'images à vérifier
    }

    const imagesInArticle = this.imageInjector.countInjectedImages(post.article);
    const expectedImages = post.images_chapitres.length;

    return imagesInArticle === expectedImages;
  }
}
