import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoginComponent } from './login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationApplication } from '../../services/authentication.application';
import { Component, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Créer un composant fictif pour le LoginWithFormComponent
@Component({
  selector: 'app-login-with-form',
  template: '<div>Mock Login Form</div>'
})
class MockLoginWithFormComponent {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authApplicationMock: jasmine.SpyObj<AuthenticationApplication>;

  beforeEach(async () => {
    // Mock pour l'AuthenticationApplication
    authApplicationMock = jasmine.createSpyObj('AuthenticationApplication', [], {
      isLoading: signal(false),
      isAuthenticated: signal(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        NoopAnimationsModule,
        MatProgressSpinnerModule
      ],
      declarations: [MockLoginWithFormComponent],
      providers: [
        { provide: AuthenticationApplication, useValue: authApplicationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher le composant de formulaire de connexion', () => {
    const loginFormElement = fixture.debugElement.query(By.css('app-login-with-form'));
    expect(loginFormElement).toBeTruthy();
  });

  it('ne devrait pas afficher le spinner de chargement par défaut', () => {
    const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinnerElement).toBeFalsy();
  });

  it('devrait afficher le spinner de chargement quand isLoading est true', () => {
    // Simuler l'état de chargement
    (authApplicationMock.isLoading as any).set(true);
    fixture.detectChanges();

    const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinnerElement).toBeTruthy();
  });

  it('devrait cacher le formulaire de connexion quand isLoading est true', () => {
    // Simuler l'état de chargement
    (authApplicationMock.isLoading as any).set(true);
    fixture.detectChanges();

    const loginFormElement = fixture.debugElement.query(By.css('.login-form:not(.hidden)'));
    expect(loginFormElement).toBeFalsy();

    const hiddenLoginFormElement = fixture.debugElement.query(By.css('.login-form.hidden'));
    expect(hiddenLoginFormElement).toBeTruthy();
  });

  it('devrait afficher le formulaire de connexion quand isLoading est false', () => {
    // S'assurer que isLoading est false
    (authApplicationMock.isLoading as any).set(false);
    fixture.detectChanges();

    const loginFormElement = fixture.debugElement.query(By.css('.login-form:not(.hidden)'));
    expect(loginFormElement).toBeTruthy();

    const hiddenLoginFormElement = fixture.debugElement.query(By.css('.login-form.hidden'));
    expect(hiddenLoginFormElement).toBeFalsy();
  });

  it('devrait réagir aux changements d\'état d\'authentification', () => {
    // Simuler l'authentification réussie
    (authApplicationMock.isAuthenticated as any).set(true);
    fixture.detectChanges();

    // Vérifier que le composant réagit correctement à l'état d'authentification
    // Note: Le comportement exact dépend de l'implémentation du composant
    // Supposons que le conteneur de connexion est caché lorsque l'utilisateur est authentifié
    const loginContainer = fixture.debugElement.query(By.css('.container.authenticated'));
    expect(loginContainer).toBeTruthy();
  });

  it('devrait avoir le titre correct', () => {
    const titleElement = fixture.debugElement.query(By.css('h1'));
    expect(titleElement.nativeElement.textContent).toContain('Connexion');
  });

  it('devrait avoir le style de container approprié', () => {
    const containerElement = fixture.debugElement.query(By.css('.container'));
    expect(containerElement).toBeTruthy();

    // Vérifier les styles (selon l'implémentation)
    const styles = window.getComputedStyle(containerElement.nativeElement);
    expect(styles.display).not.toBe('none');
  });
  
});
