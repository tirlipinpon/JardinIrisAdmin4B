import {inject, Injectable} from "@angular/core";
import {delay, Observable, of} from "rxjs";
import {SearchState} from "../store";
import {SearchInfrastructure} from "./search.infrastructure";


const fakeService: any = {
  getNewsApi(): Observable<any> {
    const searchType: any = {
      article: 'https://www.google.com',
      isLoading: false
    };

    return of(searchType).pipe(delay(1500));
  }
}

@Injectable({
  providedIn: 'root',
  useValue: fakeService
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
  getNewsApi(cptSearchArticle: number): Observable<any> {
    return of('article').pipe(delay(1500));
  }
}
