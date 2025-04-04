import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MessageAction, SearchMessage, SearchMessageService} from "../../services/search-message.service";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SearchApplication} from "../../services/search.application";

@Component({
  selector: 'app-search-with-form',
  imports: [FormsModule, MatProgressSpinnerModule, NgClass, NgForOf],
  templateUrl: './search-with-form.component.html',
  styleUrl: './search-with-form.component.css'
})
export class SearchWithFormComponent implements OnInit, OnDestroy  {
  private readonly application = inject(SearchApplication);
  private readonly messageService = inject(SearchMessageService);
  private messageSubscription!: Subscription;
  messages = signal<{type: string, content: string}[]>([]);
  url_post = "";
  isLoading =  this.application.isSearching;

  ngOnInit() {
    this.messageSubscription = this.messageService.message$.subscribe(msg => {
      if (msg) {this.messages.update(currentMessages => [...currentMessages, msg]);
      }
      switch (msg?.type) {
        case 'message': {
          //statements;
          break;
        }
        case 'error': {
          //statements;
          break;
        }
        case 'success': {
          if (msg.action === MessageAction.ARTICLE) {
            this.selectArticle();
          } else if (msg.action === MessageAction.ARTICLE_VALID || msg.action === MessageAction.IDEA) {
            this.generateArticle();
          } else if (msg.action === MessageAction.GENERATED_ARTICLE) {
            this.upgradeArticle();
          } else if (msg.action === MessageAction.UPGRADED_ARTICLE) {
            this.formatInHtmlArticle();
          } else if (msg.action === MessageAction.FORMATED_IN_HTML_ARTICLE) {
            this.checkMeteo();
          } else if (msg.action === MessageAction.METEO) {
            this.savePost();
          } else if (msg.action === MessageAction.SAVED_POST) {
            this.updateIdeaPost();
            this.addImagesInArticle();
            this.generateImageIa();
          }
          break;
        }
        case 'fail': {
          if (msg.action === MessageAction.ARTICLE || msg.action === MessageAction.ARTICLE_VALID) { this.searchIdea(); }
          break;
        }
      }
    });
    this.process()
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

   process() {
    !this.url_post?this.searchArticle():this.generateArticle(this.url_post);
  }

   searchArticle() {
    this.application.searchArticle();
  }

   selectArticle() {
    this.application.selectArticle();
  }

   searchIdea() {
    this.application.searchIdea();
  }

   generateArticle(url_post? : string) {
    this.application.generateArticle(url_post);
  }

   upgradeArticle() {
    this.application.upgradeArticle();
  }

  formatInHtmlArticle() {
    this.application.formatInHtmlArticle();
  }

   checkMeteo() {
      this.application.checkMeteo();
  }

   savePost() {
    this.application.savePost();
  }

   addImagesInArticle() {
     this.application.addImagesInArticle();
  }

   updateIdeaPost() {
      this.application.updateIdeaPost();
  }

  generateImageIa() {
    this.application.generateImageIa();
  }

}
