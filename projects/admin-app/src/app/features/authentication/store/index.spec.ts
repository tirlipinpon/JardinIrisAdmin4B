import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthenticationStore } from '../store';
import { AuthenticationInfrastructure } from '../services/authentication.infrastructure';
import { of, throwError, Subject } from 'rxjs';
import { AuthenticationUser } from '../models/authentication-user';
import { Signal } from '@angular/core';

describe('AuthenticationStore', () => {
  let authInfraMock: jasmine.SpyObj<AuthenticationInfrastructure>;
  let store: any; // Utilisons any pour éviter les problèmes de typage complexes

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthenticationInfrastructure', ['login']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationInfrastructure, useValue: spy }
      ]
    });

    store = TestBed.inject(AuthenticationStore);
    authInfraMock = TestBed.inject(AuthenticationInfrastructure) as jasmine.SpyObj<AuthenticationInfrastructure>;
  });

  it('devrait être créé', () => {
    expect(store).toBeTruthy();
  });

  it('devrait avoir l\'état initial correct', () => {
    expect(store.user()).toBeUndefined();
    expect(store.isLoading()).toBeFalse();
    expect(store.isAuthenticated()).toBeFalse();
  });

  describe('logIn', () => {
    it('devrait mettre à jour l\'état avec succès après une authentification réussie', () => {
      // Arrange
      const credentials = { login: 'test@example.com', password: 'password123' };
      const mockUser: AuthenticationUser = { surname: 'Dupont' };

      authInfraMock.login.and.returnValue(of(mockUser));

      // Act
      store.logIn(credentials);

      // Assert
      expect(store.isLoading()).toBeFalse();
      expect(store.user()).toEqual(mockUser);
      expect(store.isAuthenticated()).toBeTrue();
      expect(authInfraMock.login).toHaveBeenCalledWith(credentials.login, credentials.password);
    });

    it('devrait mettre à jour l\'état isLoading pendant l\'authentification', fakeAsync(() => {
      // Arrange
      const credentials = { login: 'test@example.com', password: 'password123' };
      const mockUser: AuthenticationUser = { surname: 'Dupont' };

      // Créer un Subject pour contrôler quand la réponse est émise
      const loginSubject = new Subject<AuthenticationUser>();
      authInfraMock.login.and.returnValue(loginSubject.asObservable());

      // Vérifions que isLoading est false avant l'appel
      expect(store.isLoading()).toBeFalse();

      // Act
      store.logIn(credentials);

      // À ce stade, le logIn a été appelé mais n'a pas encore émis de résultat
      // Le store devrait être en état de chargement
      expect(store.isLoading()).toBeTrue();

      // Maintenant, émettons la réponse
      loginSubject.next(mockUser);
      loginSubject.complete();

      // Avancer le temps simulé pour permettre aux Observables de se terminer
      tick();

      // Après l'émission, isLoading devrait revenir à false
      expect(store.isLoading()).toBeFalse();
      expect(store.user()).toEqual(mockUser);
      expect(authInfraMock.login).toHaveBeenCalledWith(credentials.login, credentials.password);
    }));

    it('devrait gérer les erreurs lors de l\'authentification', () => {
      // Arrange
      const credentials = { login: 'test@example.com', password: 'wrong' };
      const error = new Error('Invalid credentials');

      authInfraMock.login.and.returnValue(throwError(() => error));

      // Act
      store.logIn(credentials);

      // Assert
      expect(store.isLoading()).toBeFalse();
      expect(store.user()).toBeUndefined();
      expect(store.isAuthenticated()).toBeFalse();
      expect(authInfraMock.login).toHaveBeenCalledWith(credentials.login, credentials.password);
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true quand user est défini', () => {
      // Arrange
      const mockUser: AuthenticationUser = { surname: 'Dupont' };

      // Act - simuler une authentification réussie
      authInfraMock.login.and.returnValue(of(mockUser));
      store.logIn({ login: 'test@example.com', password: 'password123' });

      // Assert
      expect(store.isAuthenticated()).toBeTrue();
    });

    it('devrait retourner false quand user est undefined', () => {
      // L'état initial a user à undefined
      expect(store.isAuthenticated()).toBeFalse();
    });
  });
});
