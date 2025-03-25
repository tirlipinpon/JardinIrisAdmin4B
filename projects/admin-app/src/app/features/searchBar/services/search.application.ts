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

  private initializeEffects(): void {
    this.isSearchingEffect();
    this.isIdeaEffect();
    this.isGeneratedArticle();
  }

  searchArticle(url_post: string): void {
    if (!url_post.length) {
      this.messageService.sendMessage('Articles recherche en cour pour la Belgique.');
      this.store.searchArticle(this.cptSearchArticle++);
    }
  }

  searchIdea(): void {
      this.messageService.sendMessage('Idée recherche en cour.');
      this.store.searchIdea();
  }

  generateArticle(): void {
    this.messageService.sendMessage('Géneration d article en cour.');
    this.store.generateArticle();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  private isSearchingEffect(): void {
    effect(() => {
      if (this.store.getArticles()) {
        if (this.store.isArticlesFound() ) {
          this.messageService.sendSuccess('Articles trouvés.', 'article');
        } else if (this.cptSearchArticle < 2) {
          this.messageService.sendMessage('Articles recherche élargie pour l’Europe.');
          this.store.searchArticle(this.cptSearchArticle++);
        } else if (this.cptSearchArticle === 2) {
          this.messageService.sendFail('Articles non trouvés en Europe.', 'article');
        }
      }
    });
  }

  private isIdeaEffect(): void {
    effect(() => {
      console.log('getIdeaByMonth() = ', this.store.getIdeaByMonth())
      if(this.store.getIdeaByMonth()!==null) {
        if (!this.store.isIdeaByMonth()) {
          this.messageService.sendError('Idée non trouvé dans la liste.');
        } else if (this.store.isIdeaByMonth()) {
          this.messageService.sendSuccess('Idée trouvés dans la liste.', 'idea');
        }
      }
    });
  }

  private isGeneratedArticle(): void {
    effect(() => {
      console.log('isGeneratedArticle() = ', this.store.isGeneratedArticle())
      if(this.store.getGeneratedArticle()!==null) {
        if(this.store.isGeneratedArticle()) {
          this.messageService.sendSuccess('Article générer.', 'generatedArticle');
        } else {
          this.messageService.sendError('Article à générer a une erreur.');
        }
      }
    });
  }

}
