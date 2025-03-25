// search-message.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchMessage {
  type: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchMessageService {
  private messageSubject = new BehaviorSubject<SearchMessage | null>(null);
  public message$: Observable<SearchMessage | null> = this.messageSubject.asObservable();

  sendMessage(type: string, content: string): void {
    this.messageSubject.next({ type, content });
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }
}
