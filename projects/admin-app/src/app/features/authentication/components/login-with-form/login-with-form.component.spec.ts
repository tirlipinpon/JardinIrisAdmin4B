import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginWithFormComponent } from './login-with-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { AuthenticationApplication } from '../../services/authentication.application';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('LoginWithFormComponent', () => {
  let component: LoginWithFormComponent;
  let fixture: ComponentFixture<LoginWithFormComponent>;
  let authApplicationMock: jasmine.SpyObj<AuthenticationApplication>;

  beforeEach(async () => {
    // Création d'un mock pour AuthenticationApplication
    authApplicationMock = jasmine.createSpyObj('AuthenticationApplication', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        LoginWithFormComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthenticationApplication, useValue: authApplicationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWithFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser le formulaire avec des valeurs par défaut', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.email.value).toBe('aa@aa.com');
    expect(component.password.value).toBe('aaa');
    expect(component.isValid).toBeTrue();
  });

  it('devrait indiquer un formulaire invalide avec un email non valide', () => {
    component.email.setValue('email-invalide');
    expect(component.email.valid).toBeFalse();
    expect(component.isValid).toBeFalse();
  });

  it('devrait indiquer un formulaire invalide avec un mot de passe vide', () => {
    component.password.setValue('');
    expect(component.password.valid).toBeFalse();
    expect(component.isValid).toBeFalse();
  });

  it('devrait appeler la méthode login de l\'application lors de la soumission', () => {
    // Préparation des données de test
    const testEmail = 'test@example.com';
    const testPassword = 'motdepasse123';

    // Configuration du formulaire
    component.email.setValue(testEmail);
    component.password.setValue(testPassword);
    fixture.detectChanges();

    // Simuler la soumission du formulaire
    component.save();

    // Vérifier que la méthode login a été appelée avec les bons paramètres
    expect(authApplicationMock.login).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it('ne devrait pas appeler login si email est manquant', () => {
    component.email.setValue('');
    component.password.setValue('motdepasse123');
    component.save();
    expect(authApplicationMock.login).not.toHaveBeenCalled();
  });

  it('ne devrait pas appeler login si password est manquant', () => {
    component.email.setValue('test@example.com');
    component.password.setValue('');
    component.save();
    expect(authApplicationMock.login).not.toHaveBeenCalled();
  });

  it('devrait désactiver le bouton de connexion quand le formulaire est invalide', () => {
    // Rendre le formulaire invalide
    component.email.setValue('email-invalide');
    fixture.detectChanges();

    // Vérifier que le bouton est désactivé
    const submitButton = fixture.debugElement.query(By.css('button[color="primary"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('devrait activer le bouton de connexion quand le formulaire est valide', () => {
    // S'assurer que le formulaire est valide
    component.email.setValue('valide@example.com');
    component.password.setValue('motdepasse');
    fixture.detectChanges();

    // Vérifier que le bouton est activé
    const submitButton = fixture.debugElement.query(By.css('button[color="primary"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('devrait soumettre le formulaire lors du clic sur le bouton', () => {
    // Espionner la méthode save
    spyOn(component, 'save');

    // Trouver le formulaire et déclencher l'événement submit
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);

    // Vérifier que save a été appelé
    expect(component.save).toHaveBeenCalled();
  });
});
