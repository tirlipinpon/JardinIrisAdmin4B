import {Component, inject, OnDestroy, OnInit} from '@angular/core';
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

  url_post = "";
  isLoading =  this.application.isSearching;
  messages: SearchMessage[] = [];


  ngOnInit() {
    this.messageSubscription = this.messageService.message$.subscribe(msg => {
      if (msg) { this.messages.push(msg); }
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
          } else if (msg.action === MessageAction.METEO) {
            // this.addImagesInArticle();
          }
          break;
        }
        case 'fail': {
          if (msg.action === MessageAction.ARTICLE || msg.action === MessageAction.ARTICLE_VALID) { this.searchIdea(); }
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

  async process() {
    !this.url_post?this.searchArticle():this.generateArticle(this.url_post);
  }

  async searchArticle() {
    this.application.searchArticle();
  }

  async selectArticle() {
    this.application.selectArticle();
  }

  async searchIdea() {
    this.application.searchIdea();
  }

  async generateArticle(url_post? : string) {
    this.application.generateArticle(url_post);
  }

  async upgradeArticle() {
    this.application.upgradeArticle();
  }

  async formatInHtmlArticle() {
    this.application.formatInHtmlArticle();
  }

  async checkMeteo() {
    this.application.checkMeteo();
  }

  async savePost() {
    this.application.savePost();
  }

  async addImagesInArticle() {
    this.application.addImagesInArticle();
  }

}
