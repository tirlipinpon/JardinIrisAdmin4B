import {inject, Injectable} from "@angular/core";
import {from, Observable} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {extractJSONBlock} from "../../../utils/cleanJsonObject";
import {UnsplashImageService} from "./unsplash-image.service";
import {SupabaseService} from "./supabase/supabase.service";
import {PostgrestError} from "@supabase/supabase-js";
import {map} from "rxjs/operators";
import {Post} from "../../../types/post";

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

  selectArticle(articleValid: { url: string; image_url: string }[]): Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }> {
    return new Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }>(subscriber => {
      const mock = {
        valid: Math.random() > 0.5,
        explication: { raisonArticle1: "Pourquoi cet article est pertinent ou non pertinent pour le blog de jardinier en Belgique." },
        url: articleValid[0].url,
        image_url: articleValid[0].image_url
        };
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<{ id: number | null, description: string | null }> {
    return from(this.supabaseService.getFirstIdeaPostByMonth(new Date().getMonth()+1, new Date().getFullYear()))
      .pipe(
        map(result => {
          if ('id' in result) {
            return result;
          } else {
            console.error('Erreur lors de la récupération des idées:', result);
            throw result;
          }
        })
      );
    // return new Observable<string>(subscriber => {
    //   console.log(`Recherche d'idée dans le mois courrent`);
    //   const mock = `dummy idee recue`;
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
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

  savePost(post: Post): Observable<Post> {
    return from(this.supabaseService.setNewPostForm(post)).pipe(
      map(data => {
        if (data && data.length > 0) {
          return data[0]; // Retourne le premier élément du tableau
        }
        throw new Error('Aucune donnée retournée après l insertion');
      })
    );
  }

  updateIdeaPost(ideaPostId: number, postId: number): Observable<any> {
    return from(this.supabaseService.updateIdeaPostById(ideaPostId, postId));
    // return new Observable<string>(subscriber => {
    //   console.log(`Recherche d'idée dans le mois courrent`);
    //   const mock = `dummy idee recue`;
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
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
