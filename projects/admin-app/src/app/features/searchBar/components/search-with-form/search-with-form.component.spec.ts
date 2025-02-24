import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWithFormComponent } from './search-with-form.component';

describe('SerachWithFormComponent', () => {
  let component: SearchWithFormComponent;
  let fixture: ComponentFixture<SearchWithFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWithFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchWithFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
