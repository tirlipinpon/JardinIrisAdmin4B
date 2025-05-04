import { TestBed } from '@angular/core/testing';

import { InaturalistApiService } from './inaturalist-api.service';

describe('InaturalistApiService', () => {
  let service: InaturalistApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InaturalistApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
