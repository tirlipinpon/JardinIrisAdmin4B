// app.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import {SupabaseService} from "./features/searchBar/services/supabase/supabase.service";

// Mock complet pour SupabaseService
// Ajustez les méthodes selon les besoins de votre application
const mockSupabaseService = {
  // Méthodes d'authentification
  signIn: jasmine.createSpy('signIn').and.returnValue(Promise.resolve({ data: null, error: null })),
  signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve({ error: null })),
  signUp: jasmine.createSpy('signUp').and.returnValue(Promise.resolve({ data: null, error: null })),
  resetPassword: jasmine.createSpy('resetPassword').and.returnValue(Promise.resolve({ data: null, error: null })),

  // Méthodes de session
  getSession: jasmine.createSpy('getSession').and.returnValue(Promise.resolve(null)),
  getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve(null)),
  refreshSession: jasmine.createSpy('refreshSession').and.returnValue(Promise.resolve({ data: null, error: null })),

  // Méthodes de base de données
  getClient: jasmine.createSpy('getClient').and.returnValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/image.jpg' } }),
        remove: () => Promise.resolve({ data: null, error: null })
      })
    },
    auth: {
      onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.returnValue({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }),

  // Ajoutez d'autres méthodes spécifiques à votre application si nécessaire
  isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
  getCurrentUserId: jasmine.createSpy('getCurrentUserId').and.returnValue(null)
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppComponent // AppComponent en tant que composant standalone
      ],
      providers: [
        provideRouter([]),
        // Fournir le mock du service Supabase
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
