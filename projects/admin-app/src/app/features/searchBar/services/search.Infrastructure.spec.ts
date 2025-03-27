// search.infrastructure.spec.ts
import { TestBed } from '@angular/core/testing';
import { SearchInfrastructure } from './search.infrastructure';
import { TheNewsApiService } from './the-news-api.service';
import { OpenaiApiService } from './openai-api.service';
import { GetPromptsService } from './get-prompts.service';
import { PerplexityApiService } from './perplexity-api.service';
import { UnsplashImageService } from './unsplash-image.service';
import { SupabaseService } from './supabase/supabase.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('SearchInfrastructure', () => {
  let service: SearchInfrastructure;
  let theNewsApiServiceMock: jasmine.SpyObj<TheNewsApiService>;
  let openaiApiServiceMock: jasmine.SpyObj<OpenaiApiService>;
  let perplexityApiServiceMock: jasmine.SpyObj<PerplexityApiService>;
  let getPromptsServiceMock: jasmine.SpyObj<GetPromptsService>;
  let unsplashImageServiceMock: jasmine.SpyObj<UnsplashImageService>;
  let supabaseServiceMock: jasmine.SpyObj<SupabaseService>;
  
  const mockArticles = [
    { url: 'https://example.com', image_url: 'https://example.com/img.jpg' }
  ];

  beforeEach(() => {
    theNewsApiServiceMock = jasmine.createSpyObj('TheNewsApiService', ['getNewsApi']);
    openaiApiServiceMock = jasmine.createSpyObj('OpenaiApiService', ['generateContent']);
    perplexityApiServiceMock = jasmine.createSpyObj('PerplexityApiService', ['generateContent']);
    getPromptsServiceMock = jasmine.createSpyObj('GetPromptsService', ['getPrompt']);
    unsplashImageServiceMock = jasmine.createSpyObj('UnsplashImageService', ['searchImages']);
    supabaseServiceMock = jasmine.createSpyObj('SupabaseService', [
      'getFirstIdeaPostByMonth', 
      'savePost', 
      'updatePost'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        SearchInfrastructure,
        { provide: TheNewsApiService, useValue: theNewsApiServiceMock },
        { provide: OpenaiApiService, useValue: openaiApiServiceMock },
        { provide: PerplexityApiService, useValue: perplexityApiServiceMock },
        { provide: GetPromptsService, useValue: getPromptsServiceMock },
        { provide: UnsplashImageService, useValue: unsplashImageServiceMock },
        { provide: SupabaseService, useValue: supabaseServiceMock }
      ]
    });
    
    service = TestBed.inject(SearchInfrastructure);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('searchArticle', () => {
    it('devrait appeler getNewsApi avec le compteur correct', (done) => {
      const cptSearchArticle = 1;
      theNewsApiServiceMock.getNewsApi.and.returnValue(of(mockArticles));
      
      service.searchArticle(cptSearchArticle).subscribe(result => {
        expect(result).toEqual(mockArticles);
        expect(theNewsApiServiceMock.getNewsApi).toHaveBeenCalledWith(cptSearchArticle);
        done();
      });
    });
  });

  describe('selectArticle', () => {
    it('devrait retourner un objet avec valid et explication', (done) => {
      spyOn(Math, 'random').and.returnValue(0.8); // Pour s'assurer que valid soit true
      
      service.selectArticle(mockArticles).subscribe(result => {
        expect(result.valid).toBeTrue();
        expect(result.url).toEqual(mockArticles[0].url);
        expect(result.image_url).toEqual(mockArticles[0].image_url);
        expect(result.explication.raisonArticle1).toBeDefined();
        done();
      });
    });
  });

  describe('searchIdea', () => {
    it('devrait appeler getFirstIdeaPostByMonth avec le mois et l\'année actuels', async () => {
      const mockIdea = { id: 1, description: 'Test idea' };
      supabaseServiceMock.getFirstIdeaPostByMonth.and.returnValue(Promise.resolve(mockIdea));
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const result = await firstValueFrom(service.searchIdea());
      
      expect(supabaseServiceMock.getFirstIdeaPostByMonth).toHaveBeenCalledWith(currentMonth, currentYear);
      expect(result).toEqual(mockIdea);
    });
  });

  describe('generateArticle', () => {
    it('devrait retourner un article généré', (done) => {
      service.generateArticle().subscribe(result => {
        expect(result).toContain('Introduction');
        done();
      });
    });
    
    it('devrait inclure l\'url dans l\'article généré si fournie', (done) => {
      const testUrl = 'https://test-url.com';
      
      service.generateArticle(testUrl).subscribe(result => {
        expect(result).toContain(testUrl);
        expect(result).toContain('Introduction');
        done();
      });
    });
  });
});