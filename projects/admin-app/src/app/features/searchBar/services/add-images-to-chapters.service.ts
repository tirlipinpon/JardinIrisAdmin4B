import { inject, Injectable } from '@angular/core';
import { Post } from "../../../types/post";
import { TheNewsApiService } from "./the-news-api.service";
import { OpenaiApiService } from "./openai-api.service";
import { PerplexityApiService } from "./perplexity-api.service";
import { GetPromptsService } from "./get-prompts.service";
import { UnsplashImageService } from "./unsplash-image.service";
import { SupabaseService } from "./supabase/supabase.service";

/**
 * Service responsable d'ajouter des images aux chapitres d'un article
 * basé sur l'analyse du contenu de chaque chapitre
 */
@Injectable({
  providedIn: 'root'
})
export class AddImagesToChaptersService {

  constructor(
    private perplexityApiService: PerplexityApiService,
    private openaiApiService: OpenaiApiService,
    private getPromptsService: GetPromptsService,
    private unsplashImageService: UnsplashImageService,
    private supabaseService: SupabaseService
  ) {
    console.log("AddImagesToChaptersService initialisé avec services:", {
      perplexityApiService: !!perplexityApiService,
      getPromptsService: !!getPromptsService,
      unsplashImageService: !!unsplashImageService,
      supabaseService: !!supabaseService,
      openaiApiService: !!openaiApiService
    });
  }


  extractJSONBlock(input: string): string {
    const regex = /```json\s([\s\S]*?)\s```/;
    const match = input.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return input; // Si aucun bloc JSON trouvé,
  }
  extractSecondSpanContent(htmlString: string, chapitreId: number): string {
    // Expression régulière pour capturer le contenu de <span> avec l'id correspondant
    const spanMatches = htmlString.match(new RegExp(`<span id=['"]paragraphe-${chapitreId}['"]>(.*?)<\/span>`, 's'));
    // Si une correspondance est trouvée, retourne le contenu sans les balises
    if (spanMatches && spanMatches.length >= 2) {
      return spanMatches[1].trim();
    } else {
      return ''; // Retourne une chaîne vide si aucune correspondance n'est trouvée
    }
  }
  extractByPositionH4Title(texte: string, x: number): string {
    console.log(`Extraction du titre H4 du paragraphe ${x} (longueur de l'article : ${texte?.length || 0} caractères)`);
    const regex = new RegExp(`<span[^>]*id=["']paragraphe-${x}["'][^>]*>\\s*<h4>(.*?)</h4>`, 'si');
    return texte.match(regex)?.[1] ?? '';
  }

  async getKeyWordsFromChapitreInArticleAndSetImageUrl(article: string, articleId: number) {
    console.log("Début getKeyWordsFromChapitreInArticleAndSetImageUrl", { articleId });

    let chapitreKeyWordList: string[] = []
    for (let i=1; i<=6; i++) {
      console.log(`Traitement du chapitre ${i}`);
      const chapitreId = i;
      let chapitreKeyWord = "";
      let chapitreExplanation = "";
      const extractedTitle = this.extractByPositionH4Title(article, chapitreId)
      console.log(`Chapitre ${chapitreId} - Titre extrait:`, extractedTitle);
      const extractedParagraphe = this.extractSecondSpanContent(article, chapitreId)
      console.log(`Chapitre ${chapitreId} - Paragraphe extrait:`, extractedParagraphe?.substring(0, 50) + "...");
      if(!extractedTitle || extractedTitle.length) {
        try {
          // Selection des images par le titre et des mots-clés
          const prompt = this.getPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle(extractedTitle, chapitreKeyWordList);
          const response = await this.openaiApiService.fetchData(prompt, true);
          // Vérification et parsing de la réponse
          let respKeyword;
          try {
            // TODO: refactor : les deux clefs deja presente donc code double inutile
            if (response && response.length > 0) {
              let keyWord = response.match(/\{"keyWord":"\{?[^}]+\}?"\}/g);
              if (keyWord && keyWord.length > 0) {
                let test2 = this.extractJSONBlock(keyWord[0])
                respKeyword = JSON.parse(test2);
                chapitreKeyWord = respKeyword.keyWord;
                chapitreExplanation = respKeyword.explanation;
              }
              }
            } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON pour les mots-clés du chapitre :", parseError);
            continue
              ;
          }
          // Récupération des images depuis Unsplash
          const unsplashResponse = await this.unsplashImageService.getUnsplashApi(chapitreKeyWord);
          chapitreKeyWordList.push(chapitreKeyWord)
          const respImagesUrl = this.unsplashImageService.mapperUrlImage(unsplashResponse);
          // Vérification si l'URL d'image existe
          if (!respImagesUrl || !respImagesUrl.regularUrls) {
            console.error("Erreur: Aucune URL d'image trouvée pour les mots-clés:", chapitreKeyWord);
            continue
              ;
          }
          // Sélection de la meilleure image pour le chapitre
          const bestImagePrompt = this.getPromptsService.getPromptGenericSelectBestImageForChapitresInArticle(extractedParagraphe, respImagesUrl.regularUrls);
          const bestImageResponse = await this.openaiApiService.fetchData(bestImagePrompt, true);
          // Vérification et parsing de la réponse pour la meilleure image
          let dataUrl;
          try {
            const jsonBlock = this.extractJSONBlock(bestImageResponse!);
            if (jsonBlock) {
              dataUrl = JSON.parse(jsonBlock);
            } else {
              // Gérer le cas où aucun bloc JSON n'a été trouvé
              console.error("Aucun bloc JSON trouvé dans la réponse");
            }

          } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON pour la meilleure image :", parseError);
            continue
              ;
          }
          // Sauvegarde de l'URL de l'image pour le chapitre dans Supabase
          try {
            await this.supabaseService.setNewUrlImagesChapitres(dataUrl.imageUrl, chapitreId, articleId, chapitreKeyWord, chapitreExplanation);
            console.log("URL d'image enregistrée avec succès:", dataUrl);
          } catch (saveError) {
            console.error("Erreur lors de la sauvegarde de l'URL de l'image dans Supabase :", saveError);
          }
        } catch (error) {
          console.error("Erreur lors du processus de récupération des mots-clés et d'image :", error);
        }
      } else {
        console.error("Erreur lors de la recuperation du chapitre dans l article :");
      }
    }
    return { success: true };
  }
}
