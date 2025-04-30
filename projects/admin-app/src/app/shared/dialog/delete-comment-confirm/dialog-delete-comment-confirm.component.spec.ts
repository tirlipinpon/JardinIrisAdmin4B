import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteCommentConfirmComponent } from './dialog-delete-comment-confirm.component';

describe('DialogComponent', () => {
  let component: DialogDeleteCommentConfirmComponent;
  let fixture: ComponentFixture<DialogDeleteCommentConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDeleteCommentConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDeleteCommentConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
