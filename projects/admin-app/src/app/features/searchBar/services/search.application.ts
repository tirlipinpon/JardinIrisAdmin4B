import { effect, inject, Injectable, Signal } from '@angular/core';
import { SearchStore } from '../store';
import {
  MessageAction,
  SearchMessageService
} from "./search-message/search-message.service";

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
    this.isUpgradedArticleEffect();
    this.isFormatInHtmlArticleEffect();
    this.isMeteoEffect();
    this.isPostIdEffect();
    this.isAddedInternalLinkByChapterEffect();
    this.isAddedPostTitreAndIdEffect();
    this.isVideoEffect();
    this.isFaqEffect();
    this.isAddedImagesVegetalEffect();
    this.isArticleScientificUrlEffect();
  }

  get isSearching(): Signal<boolean> {
    return this.store.isLoading;
  }

  get getPostId(): Signal<number | null> {
    return this.store.getPostId;
  }

  searchArticle(): void {
      this.messageService.sendMessage('Articles recherche en cours pour ' + ((this.cptSearchArticle===0)?' Belgique' : 'Europe.'));
      this.store.searchArticle(this.cptSearchArticle++);
  }

  selectArticle(): void {
    this.messageService.sendMessage('Select un Articles en cours ' + ((this.cptSearchArticle===1)?' Belgique' : 'Europe.'));
    this.store.selectArticle();
  }

  searchIdea(): void {
      this.messageService.sendMessage('Idée recherche en cours.');
      this.store.searchIdea();
  }

  generateArticle(url_post?: string): void {
    this.messageService.sendMessage('Géneration d article en cours.');
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

  faq(): void {
    this.messageService.sendMessage('FAQ en cours.');
    this.store.faq();
  }
  saveFaq(): void {
    this.messageService.sendMessage('Save FAQ en cours.');
    this.store.saveFaq();
  }


  formatInHtmlArticle(): void {
    this.messageService.sendMessage('Format en HTML upgradeArticle en cours.');
    this.store.formatInHtmlArticle();
  }

  checkMeteo(): void {
    if(!this.store.isMeteo()){
      this.messageService.sendMessage('Météo en cours.');
      this.store.checkMeteo();
    }
  }

  savePost(): void {
    if(!this.store.isPostId()) {
      this.messageService.sendMessage('Enregistrement du post en cours.');
      this.store.savePost();
    }
  }

  updateIdeaPost(): void {
    if(this.store.isIdeaPost()) {
      this.messageService.sendMessage('Update de post idea en cours.');
      this.store.updateIdeaPost();
    }
  }

  addImagesInArticle(): void {
    this.messageService.sendMessage('Ajout d images d article en cours.');
    this.store.addImagesInArticle();
  }

  generateImageIa(): void {
    this.messageService.sendMessage('Création d une image en cours.');
    this.store.generateImageIa();
  }

  addInternalLinkByChapter(): void {
    if(!this.store.isArticleLinkAdded()) {
      this.messageService.sendMessage('Lien interne en cours.');
      this.store.addInternalLinkByChapter();
    }
  }

  addImagesVegetal(): void {
    if(!this.store.isArticleImagesVegetal()) {
      this.messageService.sendMessage('Ajout d image vegetal en cours.');
      this.store.addScientificNameFromVegetal();
    }
  }

  addUrlFromScientificNameInHtml(): void {
    if(!this.store.isArticleScientificUrl()) {
      this.messageService.sendMessage('Ajout de nom scientific en cours.');
      this.store.addUrlFromScientificNameInHtml();
    }
  }

  getPostTitreAndId(): void {
    this.messageService.sendMessage('get Post Titre And Id.');
    this.store.postTitreAndId();
  }

  addVideo(): void {
    this.messageService.sendMessage('add video en cours.');
    this.store.addVideo();
  }


  private isSearchingEffect(): void {
    effect(() => {
      if (this.store.getArticles()!==null) {
        if (this.store.isArticlesFound() ) {
          this.messageService.sendSuccess('Articles trouvés ' + ((this.cptSearchArticle===1)?' Belgique' : 'Europe.'), MessageAction.ARTICLE);
        } else if (this.cptSearchArticle < 2) {
          this.messageService.sendMessage('Articles recherche élargie pour l’Europe.');
          this.store.searchArticle(this.cptSearchArticle++);
        } else if (this.cptSearchArticle === 2) {
          this.messageService.sendFail('Articles non trouvés en Belgique et en Europe .', MessageAction.ARTICLE);
        }
      }
    });
  }

  private isArticleValidEffect(): void {
    effect(() => {
      if(this.store.getArticleValid().valid !== null) {
        if (this.store.isArticleValid()) {
          this.messageService.sendSuccess('Article validé trouvé.', MessageAction.ARTICLE_VALID);
        } else if (this.cptSearchArticle !== 2) {
          this.messageService.sendFail('Articles non valid trouve pour '+ ((this.cptSearchArticle===1)?' Belgique' : 'Europe.'), MessageAction.ARTICLE_VALID);
        } else {
          this.messageService.sendFail('Article non validé trouvé pour les deux .', MessageAction.ARTICLE);
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

  private isVideoEffect(): void {
    effect(() => {
      if(this.store.getVideo()!==null) {
        if (!this.store.isVideo()) {
          this.messageService.sendError('Video non trouvé.');
        } else {
          this.messageService.sendMessage('Video trouvés.');
        }
      }
    });
  }

  private isFaqEffect(): void {
    effect(() => {
      if(this.store.getFaq()!==null) {
        if (!this.store.isFaq()) {
          this.messageService.sendError('Faq Error.');
        } else {
          this.messageService.sendMessage('Faq terminé.');
        }
      }
    });
  }

  private isGeneratedArticleEffect(): void {
    effect(() => {
      if(this.store.getArticleGenerated()!==null) {
        if(this.store.isArticleGenerated()) {
          this.messageService.sendSuccess('Géneration terminé.', MessageAction.GENERATED_ARTICLE);
        } else {
          this.messageService.sendError('Géneration a une erreur.');
        }
      }
    });
  }

  private isUpgradedArticleEffect(): void {
    effect(() => {
      if(this.store.getArticleUpgraded()!==null) {
        if(this.store.isArticleUpgraded()) {
          this.messageService.sendSuccess('Upgrade terminé.', MessageAction.UPGRADED_ARTICLE);
        } else {
          this.messageService.sendError('Upgrade a une erreur.');
        }
      }
    });
  }

  private isAddedPostTitreAndIdEffect(): void {
    effect(() => {
      if(this.store.getPostTitreAndId()!==null) {
        if(this.store.isPostTitreAndId()) {
          this.messageService.sendMessage('get Post Titre And Id terminé.');
        } else {
          this.messageService.sendError('get Post Titre And Id a une erreur.');
        }
      }
    });
  }

  private isAddedInternalLinkByChapterEffect(): void {
    effect(() => {
      if(this.store.getArticleLinkAdded()!==null) {
        if(this.store.isArticleLinkAdded()) {
          this.messageService.sendSuccess('Lien interne terminé.', MessageAction.INTERNAL_LINK_ADDED);
        } else {
          this.messageService.sendError('Lien interne a une erreur.');
        }
      }
    });
  }

  private isAddedImagesVegetalEffect(): void {
    effect(() => {
      if(this.store.getArticleImagesVegetal()!==null) {
        if(this.store.isArticleImagesVegetal()) {
          this.messageService.sendSuccess('Ajout d image vegetal terminé.', MessageAction.IMAGE_VEGETAL_ADDED);
        } else {
          this.messageService.sendError('Ajout d image vegetal a une erreur.');
        }
      }
    });
  }

  private isArticleScientificUrlEffect(): void {
    effect(() => {
      if(this.store.getArticleScientificUrl()!==null) {
        if(this.store.isArticleScientificUrl()) {
          this.messageService.sendSuccess('Ajout de nom scientifique terminé.', MessageAction.SCIENTIFIC_URL_ADDED);
        } else {
          this.messageService.sendError('Ajout de nom scientifique a une erreur.');
        }
      }
    });
  }

  private isFormatInHtmlArticleEffect(): void {
    effect(() => {
      if(this.store.getArticleHtml() && this.store.getArticleHtml()!==null) {
        if(this.store.isArticleHtml()) {
          this.messageService.sendSuccess('Format en HTML terminé.', MessageAction.FORMATED_IN_HTML_ARTICLE);
        } else {
          this.messageService.sendError('Format en HTML a une erreur.');
        }
      }
    });
  }

  private isMeteoEffect(): void {
    effect(() => {
      if(this.store.getMeteo() && this.store.getMeteo()!==null) {
        if(this.store.isMeteo()) {
          this.messageService.sendSuccess('Météo terminé.', MessageAction.METEO);
        } else {
          this.messageService.sendError('Météo a une erreur.');
        }
      }
    });
  }

  private isPostIdEffect(): void {
    effect(() => {
      if(this.store.postId()!==null) {
        if(this.store.isPostId()) {
          this.messageService.sendSuccess('Post sauvé en db et id dans le store.', MessageAction.SAVED_POST);
        } else {
          this.messageService.sendError('Post pas sauvé y a une erreur.');
        }
        if(!this.store.isArticleValid() && !this.store.isArticleUrlImage()) {
          this.messageService.sendSuccess('Pas de article valide et donc pas d url image.', MessageAction.IDEA_IMAGE_UPDATED);
        } else {
          this.messageService.sendError('Article valid et url image trouvé donc pas de generation image.');
        }
      }
    });
  }

}
