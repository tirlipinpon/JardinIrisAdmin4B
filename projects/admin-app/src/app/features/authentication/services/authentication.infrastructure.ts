// authentication.infrastructure.ts
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {SupabaseService} from "../../../shared/supabase/supabase.service";

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  // Autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInfrastructure {
  constructor(private supabaseService: SupabaseService) {}

  login(email: string, password: string): Observable<any> {
    return this.supabaseService.signInMock(email, password).pipe(
      map(response => {
        // Vérifie si la réponse contient un utilisateur
        if (response.data?.user) {
          return {
            username: 'chewie'
          };
        } else {
          throw new Error('Utilisateur introuvable');
        }
      }),
      catchError(error => {
        // Gestion des différents types d'erreurs
        if (error.message === 'Invalid login credentials') {
          return throwError(() => new Error('Identifiants invalides'));
        }
        return throwError(() => new Error('Erreur d\'authentification'));
      })
    );
  }
}
