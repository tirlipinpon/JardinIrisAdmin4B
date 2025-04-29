import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MessageAction, SearchMessageService} from "../../services/search-message/search-message.service";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SearchApplication} from "../../services/search.application";
import { MatRadioModule } from '@angular/material/radio';
;

@Component({
  imports: [FormsModule, MatProgressSpinnerModule, MatRadioModule
    , NgClass, NgForOf],
  selector: 'app-search-with-form',
  styleUrl: './search-with-form.component.css',
  templateUrl: './search-with-form.component.html'
})
export class SearchWithFormComponent implements OnInit, OnDestroy  {
  private readonly application = inject(SearchApplication);
  private readonly messageService = inject(SearchMessageService);
  private messageSubscription!: Subscription;
  messages = signal<{type: string, content: string}[]>([]);
  url_post = "";
  isLoading =  this.application.isSearching;
  selectedOption: string = 'all';

  onOptionChange() {
    if(this.selectedOption === 'article') {
      this.url_post = "";
    }
  }

  ngOnInit() {
    this.messageSubscription = this.messageService.message$.subscribe(msg => {
      if (msg) {this.messages.update(currentMessages => [...currentMessages, msg]);
      }
      switch (msg?.type) {
        case 'success': {
          if (msg.action === MessageAction.ARTICLE) {
            this.application.selectArticle();
          } else if (msg.action === MessageAction.ARTICLE_VALID || msg.action === MessageAction.IDEA) {
            this.application.generateArticle();
          } else if (msg.action === MessageAction.GENERATED_ARTICLE) {
            this.application.getPostTitreAndId();
            this.application.addVideo();
            this.application.upgradeArticle();
          } else if (msg.action === MessageAction.UPGRADED_ARTICLE) {
            this.application.faq();
            this.application.formatInHtmlArticle();
          } else if (msg.action === MessageAction.FORMATED_IN_HTML_ARTICLE) {
            this.application.addInternalLinkByChapter();
          } else if (msg.action === MessageAction.INTERNAL_LINK_ADDED) {
            this.application.checkMeteo();
          } else if (msg.action === MessageAction.METEO) {
            this.application.savePost();
          } else if (msg.action === MessageAction.SAVED_POST) {
            this.application.updateIdeaPost();
            this.application.addImagesInArticle();
            this.application.saveFaq();
          }  else if (msg.action === MessageAction.IDEA_IMAGE_UPDATED) {
            this.application.generateImageIa();
        }
          break;
        }
        case 'fail': {
          if (msg.action === MessageAction.ARTICLE_VALID) {
            this.application.searchArticle();
          } else if (msg.action === MessageAction.ARTICLE && this.selectedOption !== 'article' && this.url_post === '') {
            this.application.searchIdea();
          }
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

   process() {
     if(this.selectedOption === 'generate' && this.url_post === '') {
       this.application.searchIdea();
     } else if (this.url_post){
       this.application.generateArticle(this.url_post);
     } else {
       this.application.searchArticle();
     }
  }

}
