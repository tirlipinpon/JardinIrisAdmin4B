import { TestBed } from '@angular/core/testing';
import { FormatInStructureService } from './format-in-structure.service';
// Ajustez ce chemin en fonction de l'emplacement relatif entre votre fichier de test et le service
import { TheNewsApiService } from '../the-news-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FormatInStructureService', () => {
  let service: FormatInStructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Pour fournir HttpClient
      ],
      providers: [
        FormatInStructureService,
        TheNewsApiService
      ]
    });
    service = TestBed.inject(FormatInStructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
