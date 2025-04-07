import { TestBed } from '@angular/core/testing';

import { FormatInStructureService } from './format-in-structure.service';

describe('FormatInStructureService', () => {
  let service: FormatInStructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatInStructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
