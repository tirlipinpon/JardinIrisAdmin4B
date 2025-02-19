import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginWithFormComponent } from './login-with-form.component';

describe('LoginWithFormComponent', () => {
  let component: LoginWithFormComponent;
  let fixture: ComponentFixture<LoginWithFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginWithFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginWithFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
