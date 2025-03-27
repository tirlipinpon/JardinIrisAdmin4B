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
    this.isArticleValidEffect();
    this.isIdeaEffect();
    this.isGeneratedArticleEffect();
    this.isFormatedInHtmlArticleEffect();
    this.isUpgradedArticleEffect();
    this.isMeteoEffect();
    this.isPostId();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  searchArticle(): void {
      this.messageService.sendMessage('Articles recherche en cours pour la Belgique.');
      this.store.searchArticle(this.cptSearchArticle++);
  }

  selectArticle(): void {
    this.messageService.sendMessage('Selecte un Articles en cours.');
    this.store.selectArticle();
  }

  searchIdea(): void {
      this.messageService.sendMessage('Idée recherche en cours.');
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
    this.messageService.sendMessage('Upgrade article en cours.');
    this.store.upgradeArticle();
  }

  formatInHtmlArticle(): void {
    this.messageService.sendMessage('Formatage en Html d article en cours.');
    this.store.formatInHtmlArticle();
  }

  checkMeteo(): void {
    this.messageService.sendMessage('Météo en cours.');
    this.store.checkMeteo();
  }

  savePost(): void {
    this.messageService.sendMessage('Enregistrement du post en cour.');
    // recuperer et traiter les données = post formated
    this.store.savePost();
  }

  updateIdeaPost(): void {
    this.messageService.sendMessage('Update de post idea en cour.');
    this.store.updateIdeaPost();
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

  private isArticleValidEffect(): void {
    effect(() => {
      if(this.store.getArticleValid().valid !== null) {
        if (this.store.isArticleValid()) {
          this.messageService.sendSuccess('Article validé trouvé.', MessageAction.ARTICLE_VALID);
        } else {
          this.messageService.sendFail('Article non validé trouvé.', MessageAction.ARTICLE_VALID);
        }
      }
    });
  }

  private isIdeaEffect(): void {
    effect(() => {
      if(this.store.getIdeaPost()!==null) {
        if (!this.store.isIdeaPost()) {
          this.messageService.sendError('Idée non trouvé dans la liste.');
        } else {
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

  private isMeteoEffect(): void {
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

  private isPostId(): void {
    effect(() => {
      if(this.store.getPostId()!==null) {
        if(this.store.isPostId()) {
          this.messageService.sendSuccess('Post sauvé en db et id dans le store.', MessageAction.SAVED_POST);
        } else {
          this.messageService.sendError('Post pas sauvé y a une erreur.');
        }
      }
    });
  }

}
