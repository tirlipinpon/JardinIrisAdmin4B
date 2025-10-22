import { Injectable } from '@angular/core';
import { ImageChapitre } from '../../../../types/imageChapitre';
import { removeFileExtension } from '../../../../utils/removeFileExtension';

@Injectable({
  providedIn: 'root'
})
export class PostImageInjectorService {

  constructor() { }

  /**
   * Injecte les images dans le contenu HTML de l'article après chaque </ul> des paragraphes
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

    // Trouver tous les spans avec ID paragraphe-X en utilisant une regex (support guillemets simples et doubles)
    const paragraphRegex = /<span id=(?:["'])paragraphe-(\d+)(?:["'])>([\s\S]*?)<\/span>/g;
    
    updatedContent = updatedContent.replace(paragraphRegex, (match, paragraphNumber, content) => {
      const paragraphId = parseInt(paragraphNumber);
      
      // Trouver l'image correspondante
      const matchingImage = imagesChapitres.find(img => img.chapitre_id === paragraphId);
      
      if (matchingImage) {
        // Construire la balise img
        const altText = removeFileExtension(matchingImage.url_Image);
        const imgTag = `<img src="${matchingImage.url_Image}" alt="${altText}" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;">`;
        
        // Trouver le PREMIER </ul> qui suit le <h4> et insérer l'image après
        const firstUlIndex = content.indexOf('</ul>');
        
        if (firstUlIndex !== -1) {
          const beforeUl = content.substring(0, firstUlIndex + 5); // +5 pour inclure </ul>
          const afterUl = content.substring(firstUlIndex + 5);
          return `<span id="paragraphe-${paragraphNumber}">${beforeUl}${imgTag}${afterUl}</span>`;
        }
      }
      
      return match; // Retourner le contenu original si pas d'image trouvée
    });
    console.log('updatedContent', updatedContent);
    return updatedContent;
  }

}
