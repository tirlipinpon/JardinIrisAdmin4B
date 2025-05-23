import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, of} from "rxjs";
import {map} from "rxjs/operators";

export interface ObservationResult {
  species: string;
  photos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InaturalistApiService {

  private apiUrl = 'https://api.inaturalist.org/v1/observations';

  constructor(private http: HttpClient) {}

  getObservations(taxonName: string, limit: number = 1): Observable<ObservationResult[]> {
    console.log('Fetching observations for:', taxonName);

    const params = {
      taxon_name: taxonName,
      photos: 'true',
      per_page: limit.toString()
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        const results = (res.results || []).map((obs: any) => {
          const species = obs.taxon?.name || 'Non identifié';
          const photos = (obs.photos || []).map((p: any) => {
            const url = p.url || '';
            // Remplacer 'square' par 'large' pour obtenir une image de meilleure
            const finalUrl = url.replace(/square\.(jpg|jpeg|png)/, 'large.$1');
            return finalUrl;
          });
          console.log(`Species: ${species}, Photos:`, photos);
          return { species, photos };
        });
        return results;
      }),
      catchError(err => {
        console.error(`Error fetching observations for ${taxonName}:`, err);
        return of([]);
      })
    );
  }
}
