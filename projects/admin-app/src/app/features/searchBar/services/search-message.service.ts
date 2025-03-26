// search-message.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Types de messages
export type MessageType = 'message' | 'error' | 'success' | 'fail';

// Structure pour les actions des messages
export const MessageAction = {
  ARTICLE: 'article',
  ARTICLE_VALID: 'articleValid',
  IDEA: 'idea',
  GENERATED_ARTICLE: 'generatedArticle',
  UPGRADED_ARTICLE: 'upgradedArticle',
  FORMATED_IN_HTML_ARTICLE: 'formatedInHtmlArticle',
  METEO: 'meteo',
} as const;

// Type pour les actions (utilisant typeof pour inférer automatiquement les valeurs)
export type MessageActionType = typeof MessageAction[keyof typeof MessageAction];

// Interface de base
interface BaseSearchMessage {
  type: MessageType;
  content: string;
  action?: MessageActionType;
}

// Type complet du message
export type SearchMessage = BaseSearchMessage;

@Injectable({
  providedIn: 'root'
})
export class SearchMessageService {
  private messageSubject = new BehaviorSubject<SearchMessage | null>(null);
  public message$: Observable<SearchMessage | null> = this.messageSubject.asObservable();

  /**
   * Méthode de base pour envoyer un message sans action
   */
  sendMessage(content: string): void {
    this.messageSubject.next({
      type: 'message',
      content
    });
  }

  /**
   * Envoyer un message d'erreur avec action obligatoire
   */
  sendError(content: string): void {
    this.messageSubject.next({
      type: 'error',
      content
    });
  }

  /**
   * Envoyer un message de succès avec action obligatoire
   */
  sendSuccess(content: string, action: MessageActionType): void {
    this.messageSubject.next({
      type: 'success',
      content,
      action
    });
  }

  /**
   * Envoyer un message d'échec
   */
  sendFail(content: string, action: MessageActionType): void {
    this.messageSubject.next({
      type: 'fail',
      content,
      action
    });
  }

  /**
   * Effacer le message actuel
   */
  clearMessage(): void {
    this.messageSubject.next(null);
  }
}
