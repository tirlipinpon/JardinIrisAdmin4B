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

  private apiKeyVideo = environment.googleApiVideo;
  private apiKeyImage = environment.googleApiImage;
  private cx = '21166a71040be463f';
  private searchUrl = 'https://www.googleapis.com/youtube/v3/search';
  private videosUrl = 'https://www.googleapis.com/youtube/v3/videos';

  constructor(private http: HttpClient) { }

  searchFrenchVideo(keyWords: string): Observable<VideoInfo[]> {
    const regions = ['FR', 'BE', '']; // Liste des régions à tester
    const requests = regions.map(region => {
      const params = {
        part: 'snippet',
        q: keyWords,
        type: 'video',
        maxResults: '5',
        order: 'relevance', // Trier par nombre de vues
        // regionCode: region, // Région à utiliser pour chaque appel
        key: this.apiKeyVideo
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
          key: this.apiKeyVideo
        };

        // Récupérer les informations des vidéos
        return this.http.get<any>(this.videosUrl, { params: statsParams }).pipe(
          map(videoResponse => {
            const items = videoResponse?.items || [];
            if (items.length === 0) return '';

            // Transformer les résultats en objets VideoInfo
            return items.map((item: any): VideoInfo => ({
              videoId: item.id,
              channelTitle: item.snippet.channelTitle,
              description: item.snippet.description
            }));

          })
        );
      })
    );
  }

  searchImage(query: string) {
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<any>(`https://www.googleapis.com/customsearch/v1?key=${this.apiKeyImage}&cx=${this.cx}&q=${encodedQuery}&searchType=image&num=10`).pipe(
      map(res => res.items.map((item: any) => ({
        link: item.link,
        mime: item.mime,
        width: item.image.width,
        height: item.image.height,
        byteSize: item.image.byteSize
      })))
    );
  }

}
