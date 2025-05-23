import { Injectable } from '@angular/core';
import {catchError, forkJoin, Observable, of} from "rxjs";
import {InaturalistApiService} from "../inaturalist-api/inaturalist-api.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AddScientificNameService {

  constructor(private inaturalistApiService: InaturalistApiService) { }

  processAddUrlFromScientificNameInHtml(html: string): Observable<string> {
    console.log('Processing HTML input:', html);
    const entries = this.extractInatEntries(html);
    console.log('Extracted entries:', entries);

    const apiCalls = entries.map(entry =>
      this.inaturalistApiService.getObservations(entry.taxonName).pipe(
        map(results => {
          const url = results.length > 0 && results[0].photos.length > 0 ? results[0].photos[0] : '';
          console.log(`Fetched URL for ${entry.taxonName}:`, url);
          return {
            ...entry,
            url
          };
        }),
        catchError(err => {
          console.error(`Error fetching observations for ${entry.taxonName}:`, err);
          return of({ ...entry, url: '' });
        })
      )
    );

    const result = forkJoin(apiCalls).pipe(
      map(finalData => {
        console.log('Final data with URLs:', finalData);
        return this.injectImageUrls(html, finalData);
      })
    );

    return result;
  }


  /**
   * Étape 1 : Extraction via regex des span inat-vegetal
   */
  private extractInatEntries(html: string): { taxonName: string, paragrapheId: string, url: string }[] {
    console.log('Extracting inat entries from HTML...');
    const matches = [...html.matchAll(
      /<span\b[^>]*\bclass\s*=\s*["']?inat-vegetal["']?[^>]*\bdata-taxon-name\s*=\s*["']([^"']+)["'][^>]*\bdata-paragraphe-id\s*=\s*["']([^"']+)["'][^>]*>/gi
    )];

    const entries = matches.map(match => ({
      taxonName: match[1],
      paragrapheId: match[2],
      url: ''
    }));

    console.log('Extracted entries:', entries);
    return entries;
  }


  /**
   * Étape 3 : Injection des URLs dans les balises <img>
   */
  private injectImageUrls(html: string, data: { paragrapheId: string, url: string }[]): string {
    console.log('Injecting image URLs into HTML...');
    return html.replace(
      /<span\b[^>]*\bclass\s*=\s*["']?inat-vegetal["']?[^>]*\bdata-paragraphe-id\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi,
      (match, paragrapheId, innerHtml) => {
        const entry = data.find(e => e.paragrapheId === paragrapheId);
        if (!entry || !entry.url) {
          console.log(`No image URL found for paragrapheId: ${paragrapheId}`);
          return match;
        }

        // Remplacement du premier <img> avec src vide ou manquant
        const updatedInner = innerHtml.replace(
          /<img\b([^>]*?)\bsrc\s*=\s*(['"]?)\s*\2/gi,
          `<img$1 src="${entry.url}"`
        );

        console.log(`Injecting URL for paragrapheId ${paragrapheId}:`, entry.url);
        return match.replace(innerHtml, updatedInner);
      }
    );
  }
}
