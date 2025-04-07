import { TestBed } from '@angular/core/testing';

import { OpenaiApiService } from './openai-api.service';

describe('OpenaiApiService', () => {
  let service: OpenaiApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenaiApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
