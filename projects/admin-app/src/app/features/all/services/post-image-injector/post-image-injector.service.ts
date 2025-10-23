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
   * @param postId - ID du post
   * @param articleContent - Contenu HTML de l'article
   * @param imagesChapitres - Tableau des images avec chapitre_id
   * @returns Contenu HTML modifié avec les images injectées
   */
  injectImagesIntoPost(postId: number, articleContent: string, imagesChapitres: ImageChapitre[]): string {
    console.log(`[PostImageInjectorService] 🚀 Début de l'injection d'images pour le post ${postId}`);
    console.log(`[PostImageInjectorService] 📊 Données d'entrée:`, {
      postId,
      articleContentLength: articleContent?.length || 0,
      imagesChapitresCount: imagesChapitres?.length || 0,
      imagesChapitres: imagesChapitres?.map(img => ({
        id: img.id,
        chapitre_id: img.chapitre_id,
        url: img.url_Image,
        changed: img.changed,
        key_word: img.chapitre_key_word
      }))
    });

    if (!articleContent || !imagesChapitres || imagesChapitres.length === 0) {
      console.warn(`[PostImageInjectorService] ⚠️ Aucune image à injecter pour le post ${postId}:`, {
        hasArticleContent: !!articleContent,
        hasImagesChapitres: !!imagesChapitres,
        imagesChapitresLength: imagesChapitres?.length || 0
      });
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
      console.log(`[PostImageInjectorService] 🔍 Traitement du paragraphe ${paragraphId}`);
      
      // Extraire le contenu du span
      const contentMatch = match.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>(.*?)<\/span>/s);
      if (!contentMatch) {
        console.warn(`[PostImageInjectorService] ⚠️ Impossible d'extraire le contenu du paragraphe ${paragraphId}`);
        return match;
      }
      
      const content = contentMatch[1];
      
      // Trouver l'image correspondante
      const matchingImage = imagesChapitres.find(img => img.chapitre_id === paragraphId);
      
      if (!matchingImage) {
        console.log(`[PostImageInjectorService] ⏭️ Aucune image trouvée pour le chapitre ${paragraphId}`);
        imagesSkippedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: false,
          reason: 'Aucune image correspondante trouvée'
        });
        return match;
      }

      // Validation de l'URL de l'image
      if (!this.validateImageUrl(matchingImage.url_Image)) {
        console.error(`[PostImageInjectorService] ❌ URL d'image invalide pour le chapitre ${paragraphId}:`, {
          url: matchingImage.url_Image,
          chapitre_id: paragraphId,
          image_id: matchingImage.id
        });
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
        // Construire la balise img avec validation des formats
        const { imgTag, altText } = this.buildImageTag(matchingImage, paragraphId, postId);
        
        // Vérifier si l'image n'est pas déjà présente
        if (content.includes('class="randomCropImage"')) {
          console.log(`[PostImageInjectorService] ℹ️ Image déjà présente dans le chapitre ${paragraphId}`);
          imagesSkippedCount++;
          injectionResults.push({
            chapitre_id: paragraphId,
            success: false,
            reason: 'Image déjà présente',
            imageUrl: matchingImage.url_Image
          });
          return match;
        }
        
        // Chercher la première balise <article> et insérer l'image avant
        const articlePattern = /<article>/i;
        const articleMatch = content.match(articlePattern);
        
        let newContent: string;
        
        if (articleMatch) {
          const articleIndex = content.indexOf(articleMatch[0]);
          const beforeArticle = content.substring(0, articleIndex);
          const afterArticle = content.substring(articleIndex);
          newContent = beforeArticle + imgTag + afterArticle;
          
          console.log(`[PostImageInjectorService] 📍 Image injectée avant <article> dans le chapitre ${paragraphId}`);
        } else {
          newContent = content + imgTag;
          console.log(`[PostImageInjectorService] 📍 Aucun <article> trouvé, image injectée à la fin du chapitre ${paragraphId}`);
        }
        
        const newSpan = `<span id="paragraphe-${paragraphId}">${newContent}</span>`;
        
        console.log(`[PostImageInjectorService] ✅ Image injectée avec succès dans le chapitre ${paragraphId}`);
        
        imagesInjectedCount++;
        injectionResults.push({
          chapitre_id: paragraphId,
          success: true,
          imageUrl: matchingImage.url_Image,
          altText
        });
        
        return newSpan;
        
      } catch (error) {
        console.error(`[PostImageInjectorService] ❌ Erreur lors de l'injection de l'image pour le chapitre ${paragraphId}:`, {
          error,
          image: matchingImage,
          paragraphId
        });
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

    console.log(`[PostImageInjectorService] 📈 Résumé: ${imagesInjectedCount} images injectées, ${imagesSkippedCount} ignorées`);

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
    const src = generateImageSrc(image.url_Image, postId);
    const altText = generateAltTextFromUrl(image.url_Image, image.chapitre_key_word);
    const imgTag = `<img src="${src}" alt="${altText}" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async">`;
    
    return { imgTag, altText };
  }

  public countInjectedImages(content: string): number {
    const imgRegex = /<img[^>]*class="randomCropImage"[^>]*>/g;
    const matches = content.match(imgRegex);
    return matches ? matches.length : 0;
  }
}
