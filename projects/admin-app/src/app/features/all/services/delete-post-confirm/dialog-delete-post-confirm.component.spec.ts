import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeletePostConfirmComponent } from './dialog-delete-post-confirm.component';

describe('DialogComponent', () => {
  let component: DialogDeletePostConfirmComponent;
  let fixture: ComponentFixture<DialogDeletePostConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDeletePostConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDeletePostConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
