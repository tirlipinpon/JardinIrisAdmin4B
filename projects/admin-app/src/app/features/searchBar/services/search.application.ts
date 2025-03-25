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

  searchIdea(): void {
      this.messageService.sendMessage('message', 'Idée recherche en cours');
      this.store.searchIdea();
  }

  private initializeEffects(): void {
    this.isSearchingEffect();
    this.isIdeaEffect();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  private isSearchingEffect(): void {
    effect(() => {

      if (this.store.getArticles()) {
        if (this.store.isArticlesFound() ) {
          this.messageService.sendMessage('success', 'Articles trouvés');
        } else if (this.cptSearchArticle < 2) {
          this.messageService.sendMessage('message', 'Articles recherche élargie pour l’Europe');
          this.store.searchArticle(this.cptSearchArticle++);
        } else if (this.cptSearchArticle === 2) {
          this.messageService.sendMessage('fail', 'Articles non trouvés en Europe');
        }
      }
    });
  }

  private isIdeaEffect(): void {
    effect(() => {
      console.log('getIdeaByMonth() = ', this.store.getIdeaByMonth())
      if(this.store.getIdeaByMonth()!==null) {
        if (!this.store.isIdeaByMonth()) {
          this.messageService.sendMessage('error', 'Idée non trouvé  dans la liste');
        } else if (this.store.isIdeaByMonth()) {
          this.messageService.sendMessage('message', 'Idée trouvés dans la liste');
        }
      }
    });
  }


}
