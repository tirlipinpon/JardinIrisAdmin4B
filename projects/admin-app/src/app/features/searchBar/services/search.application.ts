import {inject, Injectable, Signal} from "@angular/core";
import {SearchStore} from "../store";

@Injectable({providedIn: 'root'})
// le passe plat pour les composants
export class SearchApplication {
  private readonly store = inject(SearchStore);

  searchArticleValideAppli(cptSearchArticle: number) {
    this.store.searchArticleValideStore({cptSearchArticle});
  }

  get isSearchingAppli(): Signal<boolean> {
    return this.store.isSearching;
  }
}
