import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {extractJSONBlock} from "../../../utils/cleanJsonObject";
import {UnsplashImageService} from "./unsplash-image.service";
import {SupabaseService} from "./supabase/supabase.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    const openaiApiService = inject(OpenaiApiService);
    const perplexityApiService = inject(PerplexityApiService);
    const getPromptsService = inject(GetPromptsService);
    const unsplashImageService = inject(UnsplashImageService);
    const supabaseService = inject(SupabaseService);

    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService, unsplashImageService, supabaseService);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private unsplashImageService: UnsplashImageService
    , private supabaseService: SupabaseService

  ) {}

  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string }[]> {
    return this.theNewsApiService.getNewsApi(cptSearchArticle);
  }

  searchArticleValide(articles: { url: string; image_url: string }[]) {
    return this.perplexityApiService.fetchData(this.getPromptsService.selectArticle(articles));
  }

  generateArticle( url?: string) {
    return this.perplexityApiService.fetchData(this.getPromptsService.generateArticle(url));
  }

  designArticleGenerated( article: string) {
    return this.openaiApiService.fetchData(this.getPromptsService.designArticle(article));
  }

  meteoArticleGenerated() {
    return this.perplexityApiService.fetchData(this.getPromptsService.meteoArticle());
  }

  async getKeyWordsFromChapitreInArticleAndSetImageUrl(article: any): Promise<{ fk_post: number; url_image: string; chapitre_id: number; chapitre_key_word: string }[]> {
    let dataList = [];
    let chapitreKeyWordList: string[] = []
    for (let i=1; i<=6; i++) {
      const chapitreId = i;
      let chapitreKeyWord = "";
      const extractedTitle = this.extractByPositionH4Title(article.article, chapitreId)
      console.log("extractedTitle-" +  chapitreId  +" : "+ extractedTitle)
      const extractedParagraphe = this.extractSecondSpanContent(article.article, chapitreId)
      console.log("extractedParagraphe-" +  chapitreId  +" : "+ extractedTitle)
      if(extractedTitle.length) {
        try {
          // Selection des images par le titre et des mots-clés
          const prompt = this.getPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle(extractedTitle, chapitreKeyWordList);
          const response = await this.perplexityApiService.fetchData(prompt);
          // Vérification et parsing de la réponse
          let resp;
          try {
            resp = JSON.parse(extractJSONBlock(response.choices[0].message.content));
            chapitreKeyWord = resp.keyWord;
          } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON pour les mots-clés du chapitre :", parseError);
          }
          // Récupération des images depuis Unsplash
          const unsplashResponse = await this.unsplashImageService.getUnsplashApi(chapitreKeyWord);
          chapitreKeyWordList.push(chapitreKeyWord)
          const respImagesUrl = this.unsplashImageService.mapperUrlImage(unsplashResponse);
          // Vérification si l'URL d'image existe
          if (!respImagesUrl || !respImagesUrl.regularUrls) {
            console.error("Erreur: Aucune URL d'image trouvée pour les mots-clés:", chapitreKeyWord);
          }
          // Sélection de la meilleure image pour le chapitre
          const bestImagePrompt = this.getPromptsService.getPromptGenericSelectBestImageForChapitresInArticle(extractedParagraphe, respImagesUrl.regularUrls);
          const bestImageResponse = await this.perplexityApiService.fetchData(bestImagePrompt);
          // Vérification et parsing de la réponse pour la meilleure image
          let dataUrl;
          try {
            dataUrl = JSON.parse(extractJSONBlock(bestImageResponse.choices[0].message.content));
          } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON pour la meilleure image :", parseError);
          }
          // Sauvegarde de l'URL de l'image pour le chapitre dans Supabase
          try {
            // await this.supabaseService.setNewUrlImagesChapitres(dataUrl.imageUrl, chapitreId, article.id, chapitreKeyWord);
            dataList.push({ fk_post: article.id, url_image: dataUrl.imageUrl, chapitre_id: chapitreId, chapitre_key_word: chapitreKeyWord });
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
    return dataList;
  }

  extractByPositionH4Title(texte: string, x: number): string {
    const regex = new RegExp(`<span[^>]*id=["']paragraphe-${x}["'][^>]*>\\s*<h4>(.*?)</h4>`, 'i');
    const match = texte.match(regex);
    return match ? match[1] : '';
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

}
