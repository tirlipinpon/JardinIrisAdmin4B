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
      const mock = cptSearchArticle === 0 ? [] : [];
      //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<string> {
    return new Observable<string>(subscriber => {
      console.log(`Recherche d'idée dans le mois courrent`);
      const mock = `dummy idee recue`;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  generateArticle(url_post?: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = url_post ?
        `
        ${url_post} => Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
int un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre` :
        `
Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
int un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre.
        `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }


  upgradeArticle(article: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock =
        `Super Article => ${article}`;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }


  formatInHtmlArticle(generatedArticle: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = `
      <span> ${generatedArticle} </span>
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  checkMeteo(): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = `
      Ma météo est bonne 12 degrés.
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  addImagesInArticle(getFormatedInHtmlArticle: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = `
      <span> ${getFormatedInHtmlArticle} </span>
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

}
