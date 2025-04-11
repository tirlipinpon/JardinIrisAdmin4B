// add-images-to-chapters.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddImagesToChaptersService } from './add-images-to-chapters.service';
import { UnsplashImageService } from '../unsplash-image/unsplash-image.service';
import { of } from 'rxjs';

describe('AddImagesToChaptersService', () => {
  let service: AddImagesToChaptersService;
  let unsplashImageService: UnsplashImageService;

  // Mock de données pour les tests
  const mockUnsplashImages = [
    { id: '1', url: 'https://example.com/image1.jpg', description: 'Image 1' },
    { id: '2', url: 'https://example.com/image2.jpg', description: 'Image 2' }
  ];

  const mockChapters = [
    { id: '1', title: 'Chapter 1', content: 'Content 1', images: [] },
    { id: '2', title: 'Chapter 2', content: 'Content 2', images: [] }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AddImagesToChaptersService,
        UnsplashImageService
      ]
    });

    service = TestBed.inject(AddImagesToChaptersService);
    unsplashImageService = TestBed.inject(UnsplashImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Ce test vérifie simplement l'instanciation du service UnsplashImageService
  it('should have UnsplashImageService injected', () => {
    expect(unsplashImageService).toBeTruthy();
  });

  // Ajoutez des tests spécifiques aux méthodes réelles de votre service
  // Par exemple:

  /*
  it('should process images for chapters', () => {
    // Supposons que votre service a une méthode processImagesForChapters
    spyOn(service, 'processImagesForChapters').and.callThrough();

    service.processImagesForChapters(mockChapters, mockUnsplashImages);

    expect(service.processImagesForChapters).toHaveBeenCalledWith(
      mockChapters, mockUnsplashImages
    );
  });
  */

  /*
  it('should fetch and process images', () => {
    // Supposons que UnsplashImageService a une méthode getImages
    spyOn(unsplashImageService, 'getImages').and.returnValue(of(mockUnsplashImages));

    // Et que votre service a une méthode fetchAndProcessImages
    spyOn(service, 'fetchAndProcessImages').and.callThrough();

    service.fetchAndProcessImages('query');

    expect(unsplashImageService.getImages).toHaveBeenCalledWith('query');
    expect(service.fetchAndProcessImages).toHaveBeenCalledWith('query');
  });
  */
});
