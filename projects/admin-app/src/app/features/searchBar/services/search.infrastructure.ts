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

  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string  }[]> {
     // return this.theNewsApiService.getNewsApi(cptSearchArticle);
    return new Observable<{ url: string; image_url: string }[]>(subscriber => {
      console.log(`Recherche d'articles avec paramètre: ${cptSearchArticle}`);
      // Données mockées selon cptSearchArticle
      const mockArticles = cptSearchArticle === 0 ? [] : [];
      //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
      // Simuler un délai de réseau de 1 seconde
      setTimeout(() => {
        // console.log('Réponse reçue après 1 seconde');
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<string> {
    // Données mockées selon cptSearchArticle
    return new Observable<string>(subscriber => {
      console.log(`Recherche d'idée dans le mois courrent`);
      // Données mockées selon cptSearchArticle
      const mockArticles = 'dummy idee recue';
      // Simuler un délai de réseau de 1 seconde
      setTimeout(() => {
        // console.log('Réponse reçue après 1 seconde');
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }


  generateArticle(): Observable<string> {
    // Données mockées selon cptSearchArticle
    return new Observable<string>(subscriber => {
      console.log(`Génération d article`);
      // Données mockées selon cptSearchArticle
      const mockArticles = 'dummy article a ete genere voici l article';
      // Simuler un délai de réseau de 1 seconde
      setTimeout(() => {
        // console.log('Réponse reçue après 1 seconde');
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }


}
