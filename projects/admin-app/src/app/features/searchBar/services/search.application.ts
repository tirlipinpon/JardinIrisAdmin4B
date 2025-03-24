import { effect, inject, Injectable, Signal } from '@angular/core';
import { SearchStore } from '../store';
import {parseJsonSafe} from "../../../utils/cleanJsonObject";

@Injectable({ providedIn: 'root' })
export class SearchApplication {
  private readonly store = inject(SearchStore);
  private cptSearchArticle = 0;

  constructor() {
    this.initializeEffects();
  }

  searchArticle(): void {
    this.cptSearchArticle++;
    this.store.searchArticle({ cptSearchArticle: this.cptSearchArticle });
  }

  private initializeEffects(): void {
    this.isSearchingEffect();
    this.isArticleValidEffect();
    this.getArticleGeneratedEffect();
    this.imagesArticleEffect();
  }

  private isSearchingEffect(): void {
    effect(() => {
      if (this.store.articlesFound()) {
        this.store.searchArticleValide(this.store.getArticlesFound());
      } else if (this.cptSearchArticle < 3) {
        this.searchArticle();
      }
    });
  }

  private isArticleValidEffect(): void {
    effect(() => {
      const articleValide = parseJsonSafe(this.store.getArticleValide());
      if (articleValide && articleValide.valid) {
        this.generateArticle(articleValide.url, articleValide.image_url);
      } else if (this.cptSearchArticle === 1) {
        this.searchArticle();
      }
    });
  }

  private getArticleGeneratedEffect(): void {
    effect(() => {
      const articleGenerated = parseJsonSafe(this.store.getArticleGenerated());
      if (articleGenerated) {
        this.designArticle(articleGenerated.article);
        this.meteoArticle()
      }
    });
  }

  private designArticleEffect(): void {
    effect(() => {
      const getArticleGeneratedDesign = parseJsonSafe(this.store.getArticleGeneratedDesign());
      this.imagesArticle(getArticleGeneratedDesign)
    });
  }

  private imagesArticleEffect(): void {
    effect(() => {
      const articleGenerated = parseJsonSafe(this.store.getArticleGenerated());
      if (articleGenerated) {
        this.designArticle(articleGenerated.article);
        this.meteoArticle()
      }
    });
  }

  private generateArticle(url?: string, image_url?: string): void {
    this.store.generateArticle({ url, image_url });
  }

  private designArticle(article?: string): void {
    this.store.designArticle({ article });
  }

  private meteoArticle(): void {
    this.store.meteoArticle();
  }

  private imagesArticle(articleDesign: string): void {
    this.store.imagesArticle(articleDesign);
  }


  private generateImage(url?: string): void {
    this.store.generateImage({ url });
  }

  get isSearching(): Signal<boolean> {
    return this.store.isSearching;
  }
}
