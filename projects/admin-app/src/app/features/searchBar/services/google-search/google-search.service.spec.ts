import { TestBed } from '@angular/core/testing';

import { GoogleSearchService } from './google-search.service';

describe('GoogleSearchService', () => {
  let service: GoogleSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
