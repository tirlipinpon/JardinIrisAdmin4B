import {effect, inject, Injectable, Signal} from "@angular/core";
import {SearchStore} from "../store";

@Injectable({providedIn: 'root'})
// le passe plat pour les composants
export class SearchApplication {
  readonly store = inject(SearchStore);
  cptSearchArticle = 0
  searchArticle(cptSearchArticle: number): void {
    this.store.meteoArticle();
   // this.cptSearchArticle = cptSearchArticle;
    // this.store.searchArticle({cptSearchArticle});
  }

  private isSearchingEffect = effect((): void => {
    if(this.store.articlesFound()) {
      this.store.searchArticleValide(this.store.getArticlesFound());
    }
  });

  private isArticleValide = effect((): void => {
    const articleValide = this.store.getArticleValide() ?? '';
    if(articleValide.length>0) {
      const articleValideParsed = JSON.parse(articleValide)
      if(articleValideParsed.valid) {
        this.generateArticle(articleValideParsed.url, articleValideParsed.image_url)
        // this.generateImage(articleValideParsed.image_url)
      } else if(this.cptSearchArticle===1) {
        this.searchArticle(++this.cptSearchArticle);
      }
    }
  });

  private getArticleGenerated = effect((): void => {
    const articleGenerated = this.store.getArticleGenerated() ?? '';
    if(articleGenerated.length>0) {
      const articleGeneratedParsed = JSON.parse(articleGenerated)
      this.designArticle(articleGeneratedParsed.article)
    }
  });

  generateArticle(url?: string, image_url?: string): void {
    this.store.generateArticle({url, image_url});
  }

  designArticle(article?: string): void {
    this.store.designArticle({article});

  }

  generateImage(url?: string): void {
    this.store.generateImage({url});
  }


  get isSearching(): Signal<boolean> {
    return this.store.isSearching;
  }
}
