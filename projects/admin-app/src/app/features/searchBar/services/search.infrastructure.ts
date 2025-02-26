import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    const openaiApiService = inject(OpenaiApiService);
    const perplexityApiService = inject(PerplexityApiService);
    const getPromptsService = inject(GetPromptsService);

    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService,);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
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

}
