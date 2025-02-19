import {Injectable} from "@angular/core";
import {delay, Observable, of} from "rxjs";
import {SearchType} from "../store";

const fakeService: SearchInfrastructure = {
  search(url  ): Observable<any> {
    const search: any = 'Chewie url';

    return of(search).pipe(delay(1500));
  },
}
@Injectable({
  providedIn: 'root',
  useValue: fakeService
})
export class SearchInfrastructure {
  search(url: string): Observable<any> {
    throw new Error('Not implemented exception');
  }
}
