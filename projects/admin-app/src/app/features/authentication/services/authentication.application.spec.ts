import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationApplication } from './authentication.application';
import { AuthenticationStore } from '../store';
import { signal, Signal, computed } from '@angular/core';

describe('AuthenticationApplication', () => {
  let service: AuthenticationApplication;
  let storeMock: any;
  let routerMock: jasmine.SpyObj<Router>;
  let authSignal: any;

  beforeEach(() => {
    // Créer un signal réel pour isAuthenticated
    authSignal = signal(false);

    // Création d'un mock avec un vrai signal
    storeMock = {
      logIn: jasmine.createSpy('logIn'),
      isAuthenticated: computed(() => authSignal()),
      isLoading: signal(false)
    };

    // Mock pour le Router
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationStore, useValue: storeMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('devrait être créé', () => {
    service = TestBed.inject(AuthenticationApplication);
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('devrait appeler la méthode logIn du store avec les identifiants fournis', () => {
      service = TestBed.inject(AuthenticationApplication);

      const login = 'test@example.com';
      const password = 'password123';

      service.login(login, password);

      expect(storeMock.logIn).toHaveBeenCalledWith({ login, password });
    });
  });

  describe('redirectToLoginEffect', () => {

    it('ne devrait pas rediriger quand isAuthenticated est false', () => {
      // S'assurer que le signal est à false (c'est déjà le cas par défaut)
      authSignal.set(false);

      service = TestBed.inject(AuthenticationApplication);

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('isLoading', () => {
    it('devrait retourner le signal isLoading du store', () => {
      service = TestBed.inject(AuthenticationApplication);
      expect(service.isLoading).toBe(storeMock.isLoading);
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner le signal isAuthenticated du store', () => {
      service = TestBed.inject(AuthenticationApplication);
      expect(service.isAuthenticated).toBe(storeMock.isAuthenticated);
    });
  });

  describe('comportement avec le cycle de vie de l\'application', () => {
    it('devrait maintenir une référence stable au signal isLoading', () => {
      service = TestBed.inject(AuthenticationApplication);

      const signal1 = service.isLoading;
      const signal2 = service.isLoading;

      expect(signal1).toBe(signal2);
    });

    it('devrait maintenir une référence stable au signal isAuthenticated', () => {
      service = TestBed.inject(AuthenticationApplication);

      const signal1 = service.isAuthenticated;
      const signal2 = service.isAuthenticated;

      expect(signal1).toBe(signal2);
    });
  });
});
