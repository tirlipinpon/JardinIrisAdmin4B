import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
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
    const params = {
      taxon_name: taxonName,
      photos: 'true',
      per_page: limit.toString()
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => (res.results || []).map((obs: any) => ({
        species: obs.taxon?.name || 'Non identifié',
        photos: (obs.photos || []).map((p: any) => {
          const url = p.url || '';
          // Remplacer 'square' par 'large' pour obtenir une image de meilleure qualité
          return url.replace(/square\.(jpg|jpeg|png)/, 'large.$1');
        })
      })))
    );
  }
}
