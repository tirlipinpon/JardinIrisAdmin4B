import { TestBed } from '@angular/core/testing';
import { UnsplashImageService } from './unsplash-image.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UnsplashImageService', () => {
  let service: UnsplashImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Module nécessaire pour fournir HttpClient
      ],
      providers: [
        UnsplashImageService
      ]
    });
    service = TestBed.inject(UnsplashImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
