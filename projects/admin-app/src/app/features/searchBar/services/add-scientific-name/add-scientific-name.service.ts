import { Injectable } from '@angular/core';
import {forkJoin, Observable} from "rxjs";
import {InaturalistApiService} from "../inaturalist-api/inaturalist-api.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AddScientificNameService {

  constructor(private inaturalistApiService: InaturalistApiService) { }

  processAddUrlFromScientificNameInHtml(html: string): Observable<string> {
    const entries = this.extractInatEntries(html);

    const apiCalls = entries.map(entry =>
      this.inaturalistApiService.getObservations(entry.taxonName).pipe(
        map(results => ({
          ...entry,
          url: results.length > 0 && results[0].photos.length > 0 ? results[0].photos[0] : ''
        }))
      )
    );

    const result = forkJoin(apiCalls).pipe(
      map(finalData => this.injectImageUrls(html, finalData))
    );
    return result
  }

  /**
   * Étape 1 : Extraction via regex des span inat-vegetal
   */
  private extractInatEntries(html: string): { taxonName: string, paragrapheId: string, url: string }[] {
    const matches = [...html.matchAll(
      /<span\b[^>]*\bclass\s*=\s*["']?inat-vegetal["']?[^>]*\bdata-taxon-name\s*=\s*["']([^"']+)["'][^>]*\bdata-paragraphe-id\s*=\s*["']([^"']+)["'][^>]*>/gi
    )];

    const test = matches.map(match => ({
      taxonName: match[1],
      paragrapheId: match[2],
      url: ''
    }));
    return test;
  }

  /**
   * Étape 3 : Injection des URLs dans les balises <img>
   */
  private injectImageUrls(html: string, data: { paragrapheId: string, url: string }[]): string {
    return html.replace(
      /<span\b[^>]*\bclass\s*=\s*["']?inat-vegetal["']?[^>]*\bdata-paragraphe-id\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi,
      (match, paragrapheId, innerHtml) => {
        const entry = data.find(e => e.paragrapheId === paragrapheId);
        if (!entry || !entry.url) return match;

        // Remplacement du premier <img> avec src vide ou manquant
        const updatedInner = innerHtml.replace(
          /<img\b([^>]*?)\bsrc\s*=\s*(['"]?)\s*\2/gi,
          `<img$1 src="${entry.url}"`
        );

        return match.replace(innerHtml, updatedInner);
      }
    );
  }
}
