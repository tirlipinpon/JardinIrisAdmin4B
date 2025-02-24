import {inject, Injectable} from "@angular/core";
import {delay, Observable, of} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {AuthenticationUser} from "../../authentication/models/authentication-user";
import {AuthenticationInfrastructure} from "../../authentication/services/authentication.infrastructure";
import {SearchState, SearchStore, SearchType} from "../store";



@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    return new SearchInfrastructure(theNewsApiService);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService) {}

  searchArticleValide(cptSearchArticle: number): Observable<SearchState> {
    return this.theNewsApiService.getNewsApi(cptSearchArticle);
  }
}
