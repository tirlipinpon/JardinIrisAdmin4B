import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditVideoConfirmComponent } from './dialog-edit-video-confirm.component';

describe('DialogComponent', () => {
  let component: DialogEditVideoConfirmComponent;
  let fixture: ComponentFixture<DialogEditVideoConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditVideoConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditVideoConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
