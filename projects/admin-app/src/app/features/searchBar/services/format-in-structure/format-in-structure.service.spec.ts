// format-in-structure.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormatInStructureService } from './format-in-structure.service';
import { TheNewsApiService } from '../the-news-api.service';
import { of } from 'rxjs';
import {OpenaiApiService} from "../openai-api/openai-api.service";
import {PerplexityApiService} from "../perplexity-api/perplexity-api.service";
import {GetPromptsService} from "../get-prompts/get-prompts.service";
import {UnsplashImageService} from "../unsplash-image/unsplash-image.service";
import {SupabaseService} from "../supabase/supabase.service";
import {AddImagesToChaptersService} from "../add-image-to-chapters/add-images-to-chapters.service";

describe('FormatInStructureService', () => {
  let service: FormatInStructureService;

  // Créer des mocks pour tous les services dépendants
  const theNewsApiServiceMock = jasmine.createSpyObj('TheNewsApiService', ['getNewsApi']);
  const openaiApiServiceMock = jasmine.createSpyObj('OpenaiApiService', ['fetchData']);
  const perplexityApiServiceMock = jasmine.createSpyObj('PerplexityApiService', ['fetchData']);
  const getPromptsServiceMock = jasmine.createSpyObj('GetPromptsService', [
    'getPromptGenericAddInternalLinkInArticle',
    'upgradeArticle',
    'formatInHtmlArticle'
  ]);
  const unsplashImageServiceMock = jasmine.createSpyObj('UnsplashImageService', ['searchPhotos']);
  const supabaseServiceMock = jasmine.createSpyObj('SupabaseService', ['getPostTitreAndId']);
  const addImagesToChaptersServiceMock = jasmine.createSpyObj('AddImagesToChaptersService', ['addImages']);

  // Configuration des retours par défaut des mocks
  supabaseServiceMock.getPostTitreAndId.and.returnValue(Promise.resolve([]));
  openaiApiServiceMock.fetchData.and.returnValue(Promise.resolve('{"textWithLinks": "text"}'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Importer ce module pour le mock de HttpClient
      ],
      providers: [
        FormatInStructureService,
        { provide: TheNewsApiService, useValue: theNewsApiServiceMock },
        { provide: OpenaiApiService, useValue: openaiApiServiceMock },
        { provide: PerplexityApiService, useValue: perplexityApiServiceMock },
        { provide: GetPromptsService, useValue: getPromptsServiceMock },
        { provide: UnsplashImageService, useValue: unsplashImageServiceMock },
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: AddImagesToChaptersService, useValue: addImagesToChaptersServiceMock }
      ]
    });
    service = TestBed.inject(FormatInStructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
