import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Component, EventEmitter, Injector, Input, Output, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { AuthenticationStore } from "../../store";

// Interface pour les identifiants de connexion
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour l'utilisateur authentifié
interface AuthenticationUser {
  id: string;
  email: string;
  // Ajoutez d'autres propriétés selon votre modèle
}

// Mock du AuthenticationStore avec une méthode simple au lieu de rxMethod
class MockAuthStore {
  // Création de signals
  user = signal<AuthenticationUser | null | undefined>(undefined);
  isLoading = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);

  // Une méthode de mock simple qui n'utilise pas rxMethod
  logIn(credentials: LoginCredentials): Observable<LoginCredentials> {
    this.isLoading.set(true);

    // Simuler une connexion asynchrone
    setTimeout(() => {
      this.isLoading.set(false);
      this.isAuthenticated.set(true);
      this.user.set({
        id: '1',
        email: credentials.email
      });
    }, 100);

    return of(credentials);
  }
}

// Composant standalone mock pour LoginWithFormComponent
@Component({
  selector: 'app-login-with-form',
  template: '<div class="mock-login-form">Login Form Mock</div>',
  standalone: true
})
class MockLoginWithFormComponent {
  @Output() formSubmit = new EventEmitter<LoginCredentials>();
  @Input() errorMessage: string | null = null;
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authStore: MockAuthStore;

  beforeEach(async () => {
    // Créer une instance simple du mock sans rxMethod
    const authStoreMock = new MockAuthStore();

    await TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule,
        MockLoginWithFormComponent,
        provideNoopAnimations()
      ],
      declarations: [
        LoginComponent
      ],
      providers: [
        { provide: AuthenticationStore, useValue: authStoreMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authStore = TestBed.inject(AuthenticationStore) as unknown as MockAuthStore;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait avoir le titre correct', () => {
    const h1Element = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(h1Element.textContent).toContain('Connexion à l\'administration');
  });

  it('devrait avoir le style de container approprié', () => {
    const containerElement = fixture.debugElement.query(By.css('.login-container')).nativeElement;
    expect(containerElement).toBeTruthy();
  });

  it('ne devrait pas afficher le spinner de chargement par défaut', () => {
    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeFalsy();
  });

  it('devrait afficher le formulaire de connexion quand isLoading est false', () => {
    authStore.isLoading.set(false);
    fixture.detectChanges();

    const loginForm = fixture.debugElement.query(By.css('app-login-with-form'));
    expect(loginForm).toBeTruthy();
  });

  it('devrait cacher le formulaire de connexion quand isLoading est true', () => {
    authStore.isLoading.set(true);
    fixture.detectChanges();

    const loginForm = fixture.debugElement.query(By.css('app-login-with-form'));
    expect(loginForm).toBeFalsy();
  });

  it('devrait afficher le spinner de chargement quand isLoading est true', () => {
    authStore.isLoading.set(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('devrait réagir aux changements d\'état d\'authentification', () => {
    // Simuler une connexion réussie
    authStore.isLoading.set(true);
    fixture.detectChanges();

    // Vérifier que le spinner est affiché
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-login-with-form'))).toBeFalsy();

    // Simuler la fin du chargement
    authStore.isLoading.set(false);
    authStore.isAuthenticated.set(true);
    fixture.detectChanges();

    // Vérifier que le spinner est caché
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeFalsy();
  });

  it('devrait gérer la soumission du formulaire', () => {
    spyOn(authStore, 'logIn').and.callThrough();

    // S'assurer que le formulaire est visible
    authStore.isLoading.set(false);
    fixture.detectChanges();

    // Simuler la soumission du formulaire
    const loginFormComponent = fixture.debugElement.query(By.directive(MockLoginWithFormComponent));
    const mockCredentials: LoginCredentials = { email: 'test@example.com', password: 'password123' };

    loginFormComponent.componentInstance.formSubmit.emit(mockCredentials);

    // Vérifier que la méthode logIn a été appelée
    expect(authStore.logIn).toHaveBeenCalled();
  });
});
