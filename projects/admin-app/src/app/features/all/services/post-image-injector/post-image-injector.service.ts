import { Injectable } from '@angular/core';
import { ImageChapitre } from '../../../../types/imageChapitre';
import {
    generateAltTextFromUrl,
    generateImageSrc
} from '../../../../utils/supabase-image-utils';

@Injectable({
  providedIn: 'root'
})
export class PostImageInjectorService {

  constructor() { }

  /**
   * Injecte les images dans les spans paragraphe-X avant la première balise <article>
   * Version pour l'admin - garde les URLs Supabase de la DB
   * @param postId - ID du post
   * @param articleContent - Contenu HTML de l'article
   * @param imagesChapitres - Tableau des images avec chapitre_id
   * @returns Contenu HTML modifié avec les images injectées
   */
  injectImagesIntoPost(postId: number, articleContent: string, imagesChapitres: ImageChapitre[]): string {
    if (!articleContent || !imagesChapitres || imagesChapitres.length === 0) {
      return articleContent;
    }

    let updatedContent = articleContent;
    let imagesInjectedCount = 0;
    let imagesSkippedCount = 0;
    const injectionResults: Array<{
      chapitre_id: number;
      success: boolean;
      reason?: string;
      imageUrl?: string;
      altText?: string;
    }> = [];

    // Regex pour trouver les spans paragraphe-X
    const paragraphRegex = /<span\s+id=(?:["'])paragraphe-(\d+)(?:["'])\s*>(.*?)<\/span>/gs;
    
    updatedContent = updatedContent.replace(paragraphRegex, (match, paragraphNumber) => {
      const paragraphId = parseInt(paragraphNumber);
      
      // Extraire le contenu du span
      const contentMatch = match.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>(.*?)<\/span>/s);
      if (!contentMatch) {
        return match;
      }
      
      const content = contentMatch[1];
      
      // Trouver l'image correspondante
      const matchingImage = imagesChapitres.find(img => img.chapitre_id === paragraphId);
      
      if (!matchingImage) {
        // Créer une image dummy avec l'URL placeholder
        const dummyImage = {
          id: 0,
          fk_post: postId,
          chapitre_id: paragraphId,
          url_Image: 'https://www.jardin-iris.be/assets/images/logo.png',
          chapitre_key_word: `chapitre-${paragraphId}`,
          changed: false
        };
        
        // Utiliser la fonction helper pour injecter l'image
        const result = this.injectImageIntoContent(content, dummyImage, paragraphId, postId);
        injectionResults.push(result.injectionResult);
        imagesInjectedCount++;
        return result.newSpan;
      }

      // Validation de l'URL de l'image
      if (!this.validateImageUrl(matchingImage.url_Image)) {
        imagesSkippedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: false,
          reason: 'URL d\'image invalide',
          imageUrl: matchingImage.url_Image
        });
        return match;
      }

      try {
        // Vérifier si l'image n'est pas déjà présente
        if (content.includes('class="randomCropImage"')) {
          imagesSkippedCount++;
          injectionResults.push({
            chapitre_id: paragraphId,
            success: false,
            reason: 'Image déjà présente',
            imageUrl: matchingImage.url_Image
          });
          return match;
        }
        
        // Utiliser la fonction helper pour injecter l'image
        const result = this.injectImageIntoContent(content, matchingImage, paragraphId, postId);
        injectionResults.push(result.injectionResult);
        imagesInjectedCount++;
        return result.newSpan;
        
      } catch (error) {
        console.error(`[PostImageInjectorService] Erreur injection image chapitre ${paragraphId}:`, error);
        imagesSkippedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: false,
          reason: `Erreur: ${error}`,
          imageUrl: matchingImage.url_Image
        });
        return match;
      }
    });

    return updatedContent;
  }

  private validateImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private buildImageTag(image: ImageChapitre, chapitreId: number, postId: number): { imgTag: string; altText: string } {
    // Dans l'admin, on garde les URLs Supabase de la DB (pas de transformation)
    // Mais pour les URLs externes (Pexels, etc.), on les garde aussi
    const src = image.url_Image;
    const altText = generateAltTextFromUrl(image.url_Image, image.chapitre_key_word);
    const imgTag = `<img src="${src}" alt="${altText}" class="randomCropImage clickable-image" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async" data-image-id="${image.id}" data-post-id="${postId}">`;
    
    return { imgTag, altText };
  }

  private buildImageTagForValidation(image: ImageChapitre, chapitreId: number, postId: number): { imgTag: string; altText: string } {
    // Pour la validation, on transforme les URLs vers jardin-iris.be
    const src = generateImageSrc(image.url_Image, postId);
    const altText = generateAltTextFromUrl(image.url_Image, image.chapitre_key_word);
    const imgTag = `<img src="${src}" alt="${altText}" class="randomCropImage clickable-image" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async" data-image-id="${image.id}" data-post-id="${postId}">`;
    
    return { imgTag, altText };
  }

  /**
   * Version pour la validation qui transforme les URLs vers jardin-iris.be
   * Utilisée lors de la validation des posts
   */
  injectImagesIntoPostForValidation(postId: number, articleContent: string, imagesChapitres: ImageChapitre[]): string {
    if (!articleContent || !imagesChapitres || imagesChapitres.length === 0) {
      return articleContent;
    }

    let updatedContent = articleContent;
    let imagesInjectedCount = 0;
    let imagesSkippedCount = 0;
    const injectionResults: Array<{
      chapitre_id: number;
      success: boolean;
      reason?: string;
      imageUrl?: string;
      altText?: string;
    }> = [];

    // Regex pour trouver les spans paragraphe-X
    const paragraphRegex = /<span\s+id=(?:["'])paragraphe-(\d+)(?:["'])\s*>(.*?)<\/span>/gs;
    
    console.log(`[PostImageInjectorService.injectImagesIntoPostForValidation] Analyse de l'article:`, {
      postId,
      articleLength: articleContent?.length || 0,
      imagesChapitresCount: imagesChapitres?.length || 0,
      imagesChapitres: imagesChapitres?.map(img => ({
        id: img.id,
        chapitre_id: img.chapitre_id,
        url_Image: img.url_Image,
        changed: img.changed
      }))
    });
    
    updatedContent = updatedContent.replace(paragraphRegex, (match, paragraphNumber) => {
      const paragraphId = parseInt(paragraphNumber);
      
      console.log(`[PostImageInjectorService.injectImagesIntoPostForValidation] Span trouvé: paragraphe-${paragraphId}`);
      
      // Extraire le contenu du span
      const contentMatch = match.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>(.*?)<\/span>/s);
      if (!contentMatch) {
        console.log(`[PostImageInjectorService.injectImagesIntoPostForValidation] Contenu du span non trouvé pour paragraphe-${paragraphId}`);
        return match;
      }
      
      const content = contentMatch[1];
      
      // Trouver l'image correspondante
      const matchingImage = imagesChapitres.find(img => img.chapitre_id === paragraphId);
      
      console.log(`[PostImageInjectorService.injectImagesIntoPostForValidation] Image correspondante pour paragraphe-${paragraphId}:`, {
        found: !!matchingImage,
        imageId: matchingImage?.id,
        url: matchingImage?.url_Image,
        changed: matchingImage?.changed
      });
      
      if (!matchingImage) {
        // Créer une image dummy avec l'URL placeholder
        const dummyImage = {
          id: 0,
          fk_post: postId,
          chapitre_id: paragraphId,
          url_Image: 'https://www.jardin-iris.be/assets/images/logo.png',
          chapitre_key_word: `chapitre-${paragraphId}`,
          changed: false
        };
        
        // Utiliser la fonction helper pour injecter l'image avec transformation des URLs
        const result = this.injectImageIntoContent(content, dummyImage, paragraphId, postId, true);
        injectionResults.push(result.injectionResult);
        imagesInjectedCount++;
        return result.newSpan;
      }

      // Validation de l'URL de l'image
      if (!this.validateImageUrl(matchingImage.url_Image)) {
        imagesSkippedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: false,
          reason: 'URL d\'image invalide',
          imageUrl: matchingImage.url_Image
        });
        return match;
      }

      try {
        // Vérifier si l'image n'est pas déjà présente
        if (content.includes('class="randomCropImage"')) {
          imagesSkippedCount++;
          injectionResults.push({
            chapitre_id: paragraphId,
            success: false,
            reason: 'Image déjà présente',
            imageUrl: matchingImage.url_Image
          });
          return match;
        }

        // Utiliser la fonction helper pour injecter l'image avec transformation des URLs
        const result = this.injectImageIntoContent(content, matchingImage, paragraphId, postId, true);
        injectionResults.push(result.injectionResult);
        imagesInjectedCount++;
        return result.newSpan;
        
      } catch (error) {
        console.error(`[PostImageInjectorService] Erreur injection image chapitre ${paragraphId}:`, error);
        imagesSkippedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: false,
          reason: `Erreur: ${error}`,
          imageUrl: matchingImage.url_Image
        });
        return match;
      }
    });

    console.log(`[PostImageInjectorService] Validation - Images injectées: ${imagesInjectedCount}, Skippées: ${imagesSkippedCount}`);
    return updatedContent;
  }

  public countInjectedImages(content: string): number {
    const imgRegex = /<img[^>]*class="randomCropImage"[^>]*>/g;
    const matches = content.match(imgRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Helper function pour injecter une image dans le contenu
   * Évite la duplication de code entre vraies images et images dummy
   */
  private injectImageIntoContent(
    content: string, 
    image: ImageChapitre, 
    paragraphId: number, 
    postId: number,
    isForValidation: boolean = false
  ): { newSpan: string; injectionResult: any } {
    // Construire la balise img avec validation des formats
    const { imgTag, altText } = isForValidation 
      ? this.buildImageTagForValidation(image, paragraphId, postId)
      : this.buildImageTag(image, paragraphId, postId);
    
    let newContent: string;
    
    // 1️⃣ Chercher la première balise <article> et insérer l'image juste avant
    const articlePattern = /<article>/i;
    const articleMatch = content.match(articlePattern);
    
    if (articleMatch) {
      const articleIndex = content.indexOf(articleMatch[0]);
      const beforeArticle = content.substring(0, articleIndex);
      const afterArticle = content.substring(articleIndex);
      newContent = beforeArticle + imgTag + afterArticle;
    } else {
      // 2️⃣ Fallback: ajouter à la fin du contenu si pas d'<article>
      newContent = content + imgTag;
    }
    
    const newSpan = `<span id="paragraphe-${paragraphId}">${newContent}</span>`;
    
    const injectionResult = {
      chapitre_id: paragraphId,
      success: true,
      imageUrl: image.url_Image,
      altText
    };
    
    return { newSpan, injectionResult };
  }
}
