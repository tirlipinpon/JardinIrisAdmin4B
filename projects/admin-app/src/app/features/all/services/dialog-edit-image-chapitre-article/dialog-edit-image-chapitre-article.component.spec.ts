import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditImageChapitreArticleComponent } from './dialog-edit-image-chapitre-article.component';

describe('DialogEditImageChapitreArticleComponent', () => {
  let component: DialogEditImageChapitreArticleComponent;
  let fixture: ComponentFixture<DialogEditImageChapitreArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditImageChapitreArticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditImageChapitreArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
