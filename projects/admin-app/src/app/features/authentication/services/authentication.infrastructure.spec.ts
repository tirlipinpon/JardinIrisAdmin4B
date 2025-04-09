import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationInfrastructure } from './authentication.infrastructure';
import {AuthenticationUser} from "../models/authentication-user";

describe('AuthenticationInfrastructure', () => {
  let infrastructure: AuthenticationInfrastructure;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationInfrastructure]
    });

    infrastructure = TestBed.inject(AuthenticationInfrastructure);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(infrastructure).toBeTruthy();
  });

  describe('login', () => {
    it('devrait authentifier un utilisateur avec des identifiants valides', () => {
      // Arrange
      const login = 'test@example.com';
      const password = 'password123';

      const mockUser: AuthenticationUser = {
        surname: 'Dupont'
        // Ajoutez d'autres propriétés requises selon la définition exacte de AuthenticationUser
      };
      
      // Act
      infrastructure.login(login, password).subscribe((user: AuthenticationUser) => {
        // Assert
        expect(user).toEqual(mockUser);
      });

      // Vérifier la requête HTTP
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ login, password });

      req.flush(mockUser);
    });

    it('devrait gérer les erreurs d\'authentification', () => {
      // Arrange
      const login = 'test@example.com';
      const password = 'wrong';
      const errorResponse = { status: 401, statusText: 'Unauthorized' };

      // Act & Assert
      infrastructure.login(login, password).subscribe({
        next: () => fail('La requête devrait échouer'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      // Simuler une erreur HTTP
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush('Invalid credentials', errorResponse);
    });
  });
});
