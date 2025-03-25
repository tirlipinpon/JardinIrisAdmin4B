import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SearchApplication} from "../../services/search.application";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SearchMessage, SearchMessageService} from "../../services/search-message.service";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-search-with-form',
  imports: [FormsModule, MatProgressSpinnerModule, NgIf, NgClass, NgForOf],
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
          //statements;
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
      this.application.searchArticle(this.url_post);
  }


}
