import { TestBed } from '@angular/core/testing';

import { InsertInternalLinkService } from './insert-internal-link.service';

describe('InsertInternalLinkService', () => {
  let service: InsertInternalLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertInternalLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
