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

  searchArticle(url_post: string): void {
    if (!url_post.length) {
      this.store.searchArticle(this.cptSearchArticle++);
    }
  }

  private initializeEffects(): void {
    this.isSearchingEffect();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  private isSearchingEffect(): void {
    effect(() => {
      if (!this.store.isArticlesNull()) {
        if (this.store.isArticlesFound()) {
          // TODO: prevenir serach-with-form
        } else if (this.cptSearchArticle < 3) {
          this.store.searchArticle(this.cptSearchArticle++)
        }
      }
    });
  }

}
