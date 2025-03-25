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
     // return this.theNewsApiService.getNewsApi(cptSearchArticle);
    // Données mockées selon cptSearchArticle
    return new Observable<{ url: string; image_url: string }[]>(subscriber => {
      console.log(`Recherche d'articles avec paramètre: ${cptSearchArticle}`);

      // Données mockées selon cptSearchArticle
      const mockArticles = cptSearchArticle === 0 ?
        [
          {
            url: 'https://www.lalibre.be/belgique/societe/2023/05/15/une-nouvelle-reserve-naturelle-a-bruxelles-celebre-la-biodiversite-locale',
            image_url: 'https://www.lalibre.be/resizer/v2/YVUGZK5AFFAJBHKHPN7T4NR4ZM.jpg?width=640&height=480&ratio=1'
          },
          {
            url: 'https://www.rtbf.be/article/environnement-le-jardin-botanique-de-meise-presente-sa-nouvelle-collection-de-plantes-rares',
            image_url: 'https://www.rtbf.be/api/media/image/hub/1d67f0df-6ac9-4b2c-9791-35c8d8af2f1d?width=1600&height=900'
          },
          {
            url: 'https://www.dhnet.be/regions/bruxelles/2023/05/12/les-initiatives-citoyennes-vertes-fleurissent-a-bruxelles',
            image_url: 'https://www.dhnet.be/resizer/v2/KERPFAYCJNEIXBBV6BXKQFITKU.jpg?width=640&height=480&ratio=1'
          }
        ] :
        [
          {
            url: 'https://www.euronews.com/green/2023/05/14/european-green-deal-advances-with-new-biodiversity-protection-measures',
            image_url: 'https://static.euronews.com/articles/stories/07/26/11/58/1000x563_cmsv2_c5d8b02c-2b77-55d6-9d3a-7c91e93dfac3-7261158.jpg'
          },
          {
            url: 'https://www.politico.eu/article/eu-agriculture-ministers-agree-on-new-sustainable-farming-practices',
            image_url: 'https://www.politico.eu/wp-content/uploads/2023/05/14/GettyImages-1252355409-scaled.jpg'
          }
        ];

      // Simuler un délai de réseau de 1 seconde
      setTimeout(() => {
        console.log('Réponse reçue après 1 seconde');
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }




}
