import { TestBed } from '@angular/core/testing';

import { UnsplashImageService } from './unsplash-image.service';

describe('UnsplashImageService', () => {
  let service: UnsplashImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnsplashImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
