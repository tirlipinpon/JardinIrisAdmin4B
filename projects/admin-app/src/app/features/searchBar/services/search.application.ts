import {inject, Injectable, Signal} from "@angular/core";
import {SearchStore} from "../store";

@Injectable({providedIn: 'root'})
// le passe plat pour les composants
export class SearchApplication {
  private readonly store = inject(SearchStore);

  search(url: string) {
    this.store.search({url});
  }

  get isSearching(): Signal<boolean> {
    return this.store.isSearching;
  }
}
