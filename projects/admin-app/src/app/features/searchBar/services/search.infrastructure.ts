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
      const mockArticles = cptSearchArticle === 0 ? [] : [];
      //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<string> {
    return new Observable<string>(subscriber => {
      console.log(`Recherche d'idée dans le mois courrent`);
      const mockArticles = `dummy idee recue`;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  generateArticle(): Observable<string> {
    return new Observable<string>(subscriber => {
      const mockArticles = `dummy article a ete genere voici l article`;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  formatInHtmlArticle(): Observable<string> {
    return new Observable<string>(subscriber => {
      const mockArticles = `<div>dummy article a ete formate voici l article</div>`;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

}
