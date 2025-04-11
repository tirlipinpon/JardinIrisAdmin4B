import { TestBed } from '@angular/core/testing';
import { AuthenticationInfrastructure } from './authentication.infrastructure';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { of, throwError } from 'rxjs';

// Mock pour SupabaseClient
class SupabaseClientMock {
  auth = {
    signInWithPassword: jasmine.createSpy('signInWithPassword')
    // Suppression de signOut puisque nous n'utilisons pas logout()
  };
}

describe('AuthenticationInfrastructure', () => {
  let service: AuthenticationInfrastructure;
  let supabaseMock: SupabaseClientMock;

  beforeEach(() => {
    supabaseMock = new SupabaseClientMock();

    TestBed.configureTestingModule({
      providers: [
        AuthenticationInfrastructure,
        { provide: SupabaseClient, useValue: supabaseMock }
      ]
    });

    service = TestBed.inject(AuthenticationInfrastructure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return user data when login is successful', (done) => {
      const mockResponse = {
        data: {
          user: { id: 'user123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      };

      supabaseMock.auth.signInWithPassword.and.resolveTo(mockResponse);

      service.login('test@example.com', 'password123').subscribe(result => {
        expect(result).toEqual(mockResponse.data);
        expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
        done();
      });
    });

    it('devrait gérer les erreurs d\'authentification', (done) => {
      const mockError = {
        data: null,
        error: {
          message: 'Invalid login credentials',
          status: 400
        }
      };

      supabaseMock.auth.signInWithPassword.and.resolveTo(mockError);

      service.login('wrong@example.com', 'wrongpassword').subscribe({
        next: (result) => {
          fail('La requête devrait échouer');
        },
        error: (error) => {
          expect(error.message).toBe('Invalid login credentials');
          expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'wrong@example.com',
            password: 'wrongpassword'
          });
          done();
        }
      });
    });
  });

  // Suppression complète de la section describe('logout', ...)
});
