import { TestBed } from '@angular/core/testing';
import { AddImagesToChaptersService } from './add-images-to-chapters.service';
import { UnsplashImageService } from '../unsplash-image/unsplash-image.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddImagesToChaptersService', () => {
  let service: AddImagesToChaptersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Pour fournir HttpClient
      ],
      providers: [
        AddImagesToChaptersService,
        UnsplashImageService
      ]
    });
    service = TestBed.inject(AddImagesToChaptersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
