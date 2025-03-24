import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../../../environment";

@Injectable({
  providedIn: 'root'
})
export class UnsplashImageService {

  private apiUrl = `https://api.unsplash.com/search/photos?
  page=1
  &client_id=_aB21kipAl5i6ejfguG_248TcHm-JdFskzEXq590LDQ
  &query=
  &per_page=5
  &orientation=landscape`;
  options = {
    method: 'GET',
    headers: {Authorization: environment.pexelsApi},
  };
  http = inject(HttpClient);
  constructor() { }
  getUnsplashApi(keyWord: string) {
    return fetch(`https://api.pexels.com/v1/search?query=${keyWord}&per_page=5&orientation=landscape`, this.options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok'+ response);
        }
        return response.json();
      })
      .catch(err => console.error(err));
  }

  mapperUrlImage(dataApi: any): any {
    const extractRegularUrls = (data: any) => {
      return data.photos.map((photo:any) => photo.src.medium);
    }
    return  {
      "regularUrls": extractRegularUrls(dataApi)
    };
  }
}
