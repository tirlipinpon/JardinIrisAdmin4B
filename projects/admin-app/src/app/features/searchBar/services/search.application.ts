import { effect, inject, Injectable, Signal } from '@angular/core';
import { SearchStore } from '../store';
import {parseJsonSafe} from "../../../utils/cleanJsonObject";
import {
  SearchMessageService
} from "./search-message.service";

@Injectable({ providedIn: 'root' })
export class SearchApplication {
  private readonly store = inject(SearchStore);
  private readonly messageService = inject(SearchMessageService);
  private cptSearchArticle = 0;

  constructor() {
    this.initializeEffects();
  }

  searchArticle(url_post: string): void {
    if (!url_post.length) {
      this.messageService.sendMessage('message', 'Articles recherche en cours pour la Belgique');
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
      console.log("Effet déclenché - Articles:", this.store.articles());

      if (!this.store.isArticlesNull()) {
        if (this.store.isArticlesFound()) {
          this.messageService.sendMessage('success', 'Articles trouvés');
        } else if (this.cptSearchArticle < 2) {
          this.messageService.sendMessage('message', 'Articles recherche élargie pour l’Europe');
          this.store.searchArticle(this.cptSearchArticle++);
        } else if (!this.store.isIdeaByMonth()) {  // Correction : éviter de dupliquer le test
          this.messageService.sendMessage('message', 'Articles non trouvés en Europe, recherche dans la liste d’idées');
          this.store.searchIdea();
        } else {
          this.messageService.sendMessage('message', 'Articles trouvés dans la liste d’idées');
        }
      }
    });
  }


}
