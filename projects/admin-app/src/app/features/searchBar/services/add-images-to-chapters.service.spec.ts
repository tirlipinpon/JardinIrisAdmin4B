import { TestBed } from '@angular/core/testing';

import { AddImagesToChaptersService } from './add-images-to-chapters.service';

describe('AddImagesToChaptersService', () => {
  let service: AddImagesToChaptersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddImagesToChaptersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
