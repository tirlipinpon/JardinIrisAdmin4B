import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";



@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    return new SearchInfrastructure(theNewsApiService);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService) {}

  searchArticleValideInfra(cptSearchArticle: number): Observable<{ url: string; image_url: string }[]> {
    return this.theNewsApiService.getNewsApi(cptSearchArticle);
  }

}
