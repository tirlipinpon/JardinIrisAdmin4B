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
        
        // Mettre à jour le post avec les images chapitres mises à jour
        const updatedPost = { ...post, images_chapitres: imagesChapitres };
        
        // Mettre à jour le store AVANT l'injection des images
        this.updateStoreWithPost(updatedPost);
        console.log('[PostValidationService] ✓ Store mis à jour avec les nouvelles URLs d\'images');
        
        // Vérifier que les URLs ont bien été mises à jour
        const hasUpdatedUrls = updatedPost.images_chapitres?.some(img => 
          img.changed === false && img.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co')
        );
        
        if (hasUpdatedUrls) {
          console.log('[PostValidationService] ✓ URLs d\'images mises à jour détectées, injection dans l\'article...');
        }
        
        return this.injectImagesAndValidate(updatedPost);
      }),
      catchError(error => {
        console.error('[PostValidationService] Erreur lors du traitement des images:', error);
        return throwError(() => error);
      })
    );
  }

  private injectImagesAndValidate(post: Post): Observable<boolean> {
    console.log(`[PostValidationService] 🖼️ Début de l'injection d'images pour le post ${post.id}`);
    console.log(`[PostValidationService] 📊 Données du post:`, {
      postId: post.id,
      articleLength: post.article?.length || 0,
      imagesChapitresCount: post.images_chapitres?.length || 0,
      imagesChapitres: post.images_chapitres?.map(img => ({
        id: img.id,
        chapitre_id: img.chapitre_id,
        url: img.url_Image,
        changed: img.changed,
        key_word: img.chapitre_key_word
      }))
    });

    const updatedArticle = this.imageInjector.injectImagesIntoPost(
      post.id!, 
      post.article || '', 
      post.images_chapitres || []
    );

    // Vérifier si des images ont été injectées
    const imagesInjectedCount = this.imageInjector.countInjectedImages(updatedArticle);
    const originalImagesCount = this.imageInjector.countInjectedImages(post.article || '');

    console.log(`[PostValidationService] 📈 Résultat de l'injection:`, {
      postId: post.id,
      originalImagesCount,
      newImagesCount: imagesInjectedCount,
      imagesAdded: imagesInjectedCount - originalImagesCount,
      contentChanged: updatedArticle !== post.article
    });

    if (updatedArticle === post.article) {
      console.log(`[PostValidationService] ⏭️ Aucune modification nécessaire pour le post ${post.id}, validation directe`);
      this.store.validPost(post.id!);
      return of(true);
    }

    // Effectuer un diagnostic détaillé
    const diagnostic = this.imageDiagnostic.diagnosePostImages(
      post.id!, 
      updatedArticle, 
      post.images_chapitres || []
    );
    
    // Log du diagnostic
    this.imageDiagnostic.logDiagnostic(diagnostic);

    // Vérifier que l'injection a bien fonctionné
    if (imagesInjectedCount === 0 && post.images_chapitres && post.images_chapitres.length > 0) {
      console.error(`[PostValidationService] ❌ Échec de l'injection d'images pour le post ${post.id}:`, {
        expectedImages: post.images_chapitres.length,
        actualImages: imagesInjectedCount,
        imagesChapitres: post.images_chapitres,
        diagnostic: diagnostic.summary
      });
      
      // Essayer une solution alternative : injection manuelle
      return this.tryAlternativeImageInjection(post);
    }

    // Vérifier le taux d'injection
    const injectionRate = diagnostic.summary.injectionRate;
    if (injectionRate < 100) {
      console.warn(`[PostValidationService] ⚠️ Injection partielle pour le post ${post.id}:`, {
        injectionRate: `${injectionRate}%`,
        missingImages: diagnostic.summary.missingImages,
        recommendations: diagnostic.recommendations
      });
    }

    console.log(`[PostValidationService] ✅ Injection réussie pour le post ${post.id} (${injectionRate}%), mise à jour en cours...`);
    
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

  /**
   * Méthode de fallback pour l'injection d'images en cas d'échec
   * @param post - Post à traiter
   * @returns Observable avec le résultat
   */
  private tryAlternativeImageInjection(post: Post): Observable<boolean> {
    console.log(`[PostValidationService] 🔄 Tentative d'injection alternative pour le post ${post.id}`);
    
    if (!post.images_chapitres || post.images_chapitres.length === 0) {
      console.log(`[PostValidationService] ⏭️ Aucune image à injecter en mode fallback pour le post ${post.id}`);
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
          console.warn(`[PostValidationService] ⚠️ Image invalide ignorée en mode fallback:`, {
            imageId: image.id,
            chapitreId: image.chapitre_id,
            url: image.url_Image
          });
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
              
              console.log(`[PostValidationService] ✅ Image injectée en mode fallback avant <article> pour le chapitre ${image.chapitre_id}:`, {
                imageUrl: image.url_Image,
                altText,
                keyWord: image.chapitre_key_word,
                articleIndex
              });
            } else {
              // Fallback : injecter à la fin du contenu si pas d'<article>
              const newContent = content + imgTag;
              updatedArticle = updatedArticle.replace(fullMatch, fullMatch.replace(content, newContent));
              successCount++;
              
              console.log(`[PostValidationService] ✅ Image injectée en mode fallback à la fin du chapitre ${image.chapitre_id}:`, {
                imageUrl: image.url_Image,
                altText,
                keyWord: image.chapitre_key_word
              });
            }
          } else {
            console.log(`[PostValidationService] ℹ️ Image déjà présente pour le chapitre ${image.chapitre_id}`);
            successCount++;
          }
        } else {
          console.warn(`[PostValidationService] ⚠️ Span non trouvé pour le chapitre ${image.chapitre_id} en mode fallback`);
        }
      }

      console.log(`[PostValidationService] 📊 Résultat de l'injection fallback pour le post ${post.id}:`, {
        totalImages: post.images_chapitres.length,
        successCount,
        successRate: `${Math.round((successCount / post.images_chapitres.length) * 100)}%`
      });

      if (successCount > 0) {
        // Mettre à jour le post avec le nouvel article
        const updatedPost = { ...post, article: updatedArticle };
        return this.updatePostAndValidate(updatedPost);
      } else {
        console.error(`[PostValidationService] ❌ Échec complet de l'injection fallback pour le post ${post.id}`);
        // Valider quand même le post sans les images
        this.store.validPost(post.id!);
        return of(true);
      }

    } catch (error) {
      console.error(`[PostValidationService] ❌ Erreur lors de l'injection fallback pour le post ${post.id}:`, error);
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

    console.log(`[PostValidationService] 🔍 Vérification de l'injection pour le post ${post.id}:`, {
      expectedImages,
      actualImages: imagesInArticle,
      match: imagesInArticle === expectedImages
    });

    return imagesInArticle === expectedImages;
  }
}
