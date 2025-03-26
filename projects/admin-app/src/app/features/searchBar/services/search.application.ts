import { effect, inject, Injectable, Signal } from '@angular/core';
import { SearchStore } from '../store';
import {parseJsonSafe} from "../../../utils/cleanJsonObject";
import {
  MessageAction,
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
    this.isGeneratedArticleEffect();
    this.isFormatedInHtmlArticleEffect();
    this.isUpgradedArticleEffect();
    this.isMeteo();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  searchArticle(): void {
      this.messageService.sendMessage('Articles recherche en cour pour la Belgique.');
      this.store.searchArticle(this.cptSearchArticle++);
  }

  searchIdea(): void {
      this.messageService.sendMessage('Idée recherche en cour.');
      this.store.searchIdea();
  }

  generateArticle(url_post?: string): void {
    this.messageService.sendMessage('Géneration d article en cour.');
    this.store.generateArticle(url_post);
    if (url_post) {
      this.messageService.sendMessage('Sauvegarde de l url de post a generer.');
      this.store.saveUrlPost(url_post);
    }
  }

  upgradeArticle(): void {
    this.messageService.sendMessage('Upgrade article en cour.');
    this.store.upgradeArticle();
  }

  formatInHtmlArticle(): void {
    this.messageService.sendMessage('Formatage en Html d article en cour.');
    this.store.formatInHtmlArticle();
  }

  checkMeteo(): void {
    this.messageService.sendMessage('Météo en cour.');
    this.store.checkMeteo();
  }

  savePost(): void {
    this.messageService.sendMessage('Enregistrement du post en cour.');
    // this.store.savePost(this.store.formatInHtmlArticle);
  }

  addImagesInArticle(): void {
    this.messageService.sendMessage('Ajout images d article en cour.');
    this.store.addImagesInArticle();
  }

  private isSearchingEffect(): void {
    effect(() => {
      if (this.store.getArticles()!==null) {
        if (this.store.isArticlesFound() ) {
          this.messageService.sendSuccess('Articles trouvés.', MessageAction.ARTICLE);
        } else if (this.cptSearchArticle < 2) {
          this.messageService.sendMessage('Articles recherche élargie pour l’Europe.');
          this.store.searchArticle(this.cptSearchArticle++);
        } else if (this.cptSearchArticle === 2) {
          this.messageService.sendFail('Articles non trouvés en Europe.', MessageAction.ARTICLE);
        }
      }
    });
  }

  private isIdeaEffect(): void {
    effect(() => {
      if(this.store.getIdeaByMonth()!==null) {
        if (!this.store.isIdeaByMonth()) {
          this.messageService.sendError('Idée non trouvé dans la liste.');
        } else if (this.store.isIdeaByMonth()) {
          this.messageService.sendSuccess('Idée trouvés dans la liste.', MessageAction.IDEA);
        }
      }
    });
  }

  private isGeneratedArticleEffect(): void {
    effect(() => {
      if(this.store.getGeneratedArticle()!==null) {
        if(this.store.isGeneratedArticle()) {
          this.messageService.sendSuccess('Géneration terminé.', MessageAction.GENERATED_ARTICLE);
        } else {
          this.messageService.sendError('Géneration a une erreur.');
        }
      }
    });
  }

  private isUpgradedArticleEffect(): void {
    effect(() => {
      if(this.store.getUpgradedArticle()!==null) {
        if(this.store.isUpgradedArticle()) {
          this.messageService.sendSuccess('Upgrade terminé.', MessageAction.UPGRADED_ARTICLE);
        } else {
          this.messageService.sendError('Upgrade a une erreur.');
        }
      }
    });
  }

  private isFormatedInHtmlArticleEffect(): void {
    effect(() => {
      if(this.store.getFormatedInHtmlArticle()!==null) {
        if(this.store.isFormatedInHtmlArticle()) {
          this.messageService.sendSuccess('Formatage en html terminé.', MessageAction.FORMATED_IN_HTML_ARTICLE);
        } else {
          this.messageService.sendError('Formatage en html a une erreur.');
        }
      }
    });
  }

  private isMeteo(): void {
    effect(() => {
      if(this.store.getMeteo()!==null) {
        if(this.store.isMeteo()) {
          this.messageService.sendSuccess('Météo terminé.', MessageAction.METEO);
        } else {
          this.messageService.sendError('Météo a une erreur.');
        }
      }
    });
  }

}
