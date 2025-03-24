import {Component, inject} from '@angular/core';
import {SearchApplication} from "../../services/search.application";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-search-with-form',
  imports: [FormsModule, MatProgressSpinnerModule],
  templateUrl: './search-with-form.component.html',
  styleUrl: './search-with-form.component.css'
})
export class SearchWithFormComponent {
  private readonly application = inject(SearchApplication)
  url_post = "";
  isLoading =  this.application.isSearching;

  async process() {
    if (!this.url_post.length) {
      this.application.searchArticle();
    }
  }


}
