import { TestBed } from '@angular/core/testing';

import { GetPromptsService } from './get-prompts.service';

describe('GetPromptsService', () => {
  let service: GetPromptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetPromptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
