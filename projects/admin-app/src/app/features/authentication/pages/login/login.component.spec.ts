import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { LoginWithFormComponent } from '../../components/login-with-form/login-with-form.component';
import { AuthenticationApplication } from '../../services/authentication.application';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {Component, signal} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

// Mock pour AuthenticationApplication
class AuthenticationApplicationMock {
  isLoading = signal(false);
}

// Mock pour LoginWithFormComponent
@Component({
  selector: 'app-login-with-form',
  template: '',
  standalone: true
})
class MockLoginWithFormComponent {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authApplicationMock: AuthenticationApplicationMock;

  beforeEach(async () => {
    authApplicationMock = new AuthenticationApplicationMock();

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        MockLoginWithFormComponent,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: AuthenticationApplication, useValue: authApplicationMock },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get isLoading from AuthenticationApplication', () => {
    // Vérifier la valeur initiale
    expect(component.isLoading()).toBe(false);

    // Changer la valeur du signal
    authApplicationMock.isLoading.set(true);
    fixture.detectChanges();

    // Vérifier que le composant reflète le changement
    expect(component.isLoading()).toBe(true);
  });
});
