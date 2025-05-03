import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditImageChapitreConfirmComponent } from './edit-image-chapitre-confirm.component';

describe('DialogComponent', () => {
  let component: EditImageChapitreConfirmComponent;
  let fixture: ComponentFixture<EditImageChapitreConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditImageChapitreConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditImageChapitreConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
