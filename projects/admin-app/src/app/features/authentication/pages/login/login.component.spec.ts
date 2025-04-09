import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService } from "../../../searchBar/services/supabase/supabase.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

interface LoginFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-with-form',
  template: '<div>Mock Login Form Component</div>',
  standalone: true
})
class MockLoginWithFormComponent {
  @Output() formSubmit = new EventEmitter<LoginFormData>();
  @Input() loading = false;
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let supabaseServiceMock: any;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    supabaseServiceMock = {
      supabase: {
        auth: {
          signInWithPassword: jasmine.createSpy('signInWithPassword').and.returnValue(
            Promise.resolve({ data: { user: { id: '1' } }, error: null })
          )
        }
      }
    };

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        // Assurez-vous que les deux composants sont bien importés
        LoginComponent,
        MockLoginWithFormComponent
      ],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Réinitialiser explicitement le component avant détection des changements
    fixture.autoDetectChanges(false);
    fixture.detectChanges(); // Force la mise à jour du DOM
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher le composant de formulaire de connexion', () => {
    // Afficher le HTML pour débogage
    console.log('Template HTML rendu:', fixture.nativeElement.outerHTML);

    // Force une nouvelle détection des changements
    fixture.detectChanges();

    // Recherche du composant par son sélecteur au lieu de la directive
    const loginFormElement = fixture.debugElement.query(By.css('app-login-with-form'));

    expect(loginFormElement).toBeTruthy('Le composant MockLoginWithFormComponent n\'a pas été trouvé');
  });
});
