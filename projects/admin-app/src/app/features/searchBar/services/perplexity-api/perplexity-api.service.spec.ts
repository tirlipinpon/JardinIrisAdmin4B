import { TestBed } from '@angular/core/testing';

import { PerplexityApiService } from './perplexity-api.service';

describe('PerplexityApiService', () => {
  let service: PerplexityApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerplexityApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
