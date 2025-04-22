import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable, of, switchMap} from "rxjs";
import {environment} from "../../../../../../../../environment";
import {map} from "rxjs/operators";
export interface VideoInfo {
  videoId: string;
  channelTitle: string;
  description: string;
}


@Injectable({
  providedIn: 'root'
})
export class GoogleSearchService {

  private apiKey = environment.googleApi;
  private cx = 'a4fc854656f5b4b36';
  private searchUrl = 'https://www.googleapis.com/youtube/v3/search';
  private videosUrl = 'https://www.googleapis.com/youtube/v3/videos';
  private translationApiUrl = 'https://translation.googleapis.com/language/translate/v2';


  constructor(private http: HttpClient) { }

  searchFrenchVideo(keyWords: string): Observable<string> {
    const regions = ['FR', 'BE']; // Liste des régions à tester
    const requests = regions.map(region => {
      const params = {
        part: 'snippet',
        q: keyWords,
        type: 'video',
        maxResults: '5',
        order: 'relevance', // Trier par nombre de vues
        regionCode: region, // Région à utiliser pour chaque appel
        key: this.apiKey
      };
      return this.http.get<any>(this.searchUrl, { params });
    });

    return forkJoin(requests).pipe(
      switchMap(responses => {
        // Fusionner tous les résultats des différentes régions
        const allItems = responses.flatMap((response: any) => response.items || []);

        if (allItems.length === 0) return of('');

        // Récupérer les IDs des vidéos pour récupérer les statistiques
        const videoIds = allItems.map((item: any) => item.id.videoId).join(',');
        const statsParams = {
          part: 'snippet',
          id: videoIds,
          key: this.apiKey
        };

        // Récupérer les informations des vidéos
        return this.http.get<any>(this.videosUrl, { params: statsParams }).pipe(
          map(videoResponse => {
            const items = videoResponse?.items || [];
            if (items.length === 0) return '';

            // Transformer les résultats en objets VideoInfo
            return items.map((item: any) => ({
              videoId: item.id,
              channelTitle: item.snippet.channelTitle,
              description: item.snippet.description
            }));

          })
        );
      })
    );
  }

}
