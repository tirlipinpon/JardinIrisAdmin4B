// search.infrastructure.spec.ts
import { TestBed } from '@angular/core/testing';
import { SearchInfrastructure } from './search.infrastructure';
import { TheNewsApiService } from '../the-news-api.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { PerplexityApiService } from '../perplexity-api/perplexity-api.service';
import { UnsplashImageService } from '../unsplash-image/unsplash-image.service';
import { SupabaseService } from '../supabase/supabase.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { FormatInStructureService } from '../format-in-structure/format-in-structure.service';
import {AddImagesToChaptersService} from "../add-image-to-chapters/add-images-to-chapters.service";

describe('SearchInfrastructure', () => {
  let service: SearchInfrastructure;
  let theNewsApiServiceMock: jasmine.SpyObj<TheNewsApiService>;
  let openaiApiServiceMock: jasmine.SpyObj<OpenaiApiService>;
  let perplexityApiServiceMock: jasmine.SpyObj<PerplexityApiService>;
  let getPromptsServiceMock: jasmine.SpyObj<GetPromptsService>;
  let unsplashImageServiceMock: jasmine.SpyObj<UnsplashImageService>;
  let supabaseServiceMock: jasmine.SpyObj<SupabaseService>;
  let addImagesToChaptersServiceMock: jasmine.SpyObj<AddImagesToChaptersService>;
  let formatInStructureServiceMock: jasmine.SpyObj<FormatInStructureService>;

  const mockArticles = [{ url: 'https://example.com', image_url: 'https://example.com/img.jpg' }];

  beforeEach(() => {
    theNewsApiServiceMock = jasmine.createSpyObj('TheNewsApiService', ['getNewsApi']);
    openaiApiServiceMock = jasmine.createSpyObj('OpenaiApiService', ['generateContent', 'fetchData']);
    perplexityApiServiceMock = jasmine.createSpyObj('PerplexityApiService', ['generateContent']);
    getPromptsServiceMock = jasmine.createSpyObj('GetPromptsService', ['getPrompt', 'selectArticle']);
    unsplashImageServiceMock = jasmine.createSpyObj('UnsplashImageService', ['searchImages']);
    supabaseServiceMock = jasmine.createSpyObj('SupabaseService', [
      'getFirstIdeaPostByMonth',
      'savePost',
      'updatePost',
    ]);
    addImagesToChaptersServiceMock = jasmine.createSpyObj('AddImagesToChaptersService', ['process']);
    formatInStructureServiceMock = jasmine.createSpyObj('FormatInStructureService', ['format']);

    // Configuration du mock pour GetPromptsService.selectArticle
    getPromptsServiceMock.selectArticle.and.returnValue('prompt for selection');

    // Configuration du mock pour OpenaiApiService.fetchData
    openaiApiServiceMock.fetchData.and.returnValue(Promise.resolve(JSON.stringify({
      valid: true,
      explication: { raisonArticle1: 'Explication test' },
      url: mockArticles[0].url,
      image_url: mockArticles[0].image_url
    })));

    TestBed.configureTestingModule({
      providers: [
        SearchInfrastructure,
        { provide: TheNewsApiService, useValue: theNewsApiServiceMock },
        { provide: OpenaiApiService, useValue: openaiApiServiceMock },
        { provide: PerplexityApiService, useValue: perplexityApiServiceMock },
        { provide: GetPromptsService, useValue: getPromptsServiceMock },
        { provide: UnsplashImageService, useValue: unsplashImageServiceMock },
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: AddImagesToChaptersService, useValue: addImagesToChaptersServiceMock },
        { provide: FormatInStructureService, useValue: formatInStructureServiceMock },
      ],
    });

    service = TestBed.inject(SearchInfrastructure);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('searchArticle', () => {
    it('devrait appeler getNewsApi avec le compteur correct', done => {
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
    it('devrait retourner un objet avec valid et explication', done => {
      service.selectArticle(mockArticles).subscribe(result => {
        expect(result.valid).toBeTrue();
        expect(result.url).toEqual(mockArticles[0].url);
        expect(result.image_url).toEqual(mockArticles[0].image_url);
        expect(result.explication.raisonArticle1).toBeDefined();
        expect(getPromptsServiceMock.selectArticle).toHaveBeenCalledWith(mockArticles);
        expect(openaiApiServiceMock.fetchData).toHaveBeenCalledWith('prompt for selection', true);
        done();
      });
    });
  });

  describe('searchIdea', () => {
    it("devrait appeler getFirstIdeaPostByMonth avec le mois et l'année actuels", async () => {
      const mockIdea = { id: 1, description: 'Test idea' };
      supabaseServiceMock.getFirstIdeaPostByMonth.and.returnValue(Promise.resolve(mockIdea));

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const result = await firstValueFrom(service.searchIdea());

      expect(supabaseServiceMock.getFirstIdeaPostByMonth).toHaveBeenCalledWith(currentMonth, currentYear);
      expect(result).toEqual(mockIdea);
    });
  });
});
