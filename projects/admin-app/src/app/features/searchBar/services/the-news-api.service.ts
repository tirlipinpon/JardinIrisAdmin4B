import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {environment} from "../../../../../../../environment";
import {HttpClient} from "@angular/common/http";
import {afficherCategories} from "../../../utils/afficherCategories";
import {formatCurrentDateUs} from "../../../utils/getFormattedDate";
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TheNewsApiService {
  private criteriaList = ['Europe','Belgique']
  private apiUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${environment.newsApiToken}
    &search_fields=title,description,main_text
    &categories=general,tech,travel,entertainment,business,food,politics
    &exclude_categories=sports
    &published_on=${formatCurrentDateUs()}
    &search=Belgique+(${afficherCategories('|')})
    &language=fr,nl,en
    &page=1`;
  private apiUrl2 = `https://api.thenewsapi.com/v1/news/all?api_token=${environment.newsApiToken}
    &search_fields=title,description,main_text
    &categories=general,tech,travel,entertainment,business,food,politics
    &exclude_categories=sports
    &published_on=${formatCurrentDateUs()}
    &search=Europe+(${afficherCategories('|')})
    &language=fr,nl,en
    &page=1`;

  http = inject(HttpClient);

  getNewsApi(cptSearchArticle: number): Observable<{ url: string; image_url: string }[]> {
    const apiUrl = cptSearchArticle === 1 ? this.apiUrl : this.apiUrl2;
    return this.http.get<any>(apiUrl).pipe(
      map(news => this.mapperNewsApi(news))
    );
  }

  mapperNewsApi(news: any): {url: string, image_url: string}[] {
    return news.data.map((article: any) => {
      return {
        url: article.url,
        image_url: article.image_url
      };
    });
  }

}
