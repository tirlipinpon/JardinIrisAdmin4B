// search.infrastructure.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchInfrastructure } from './search.infrastructure';
import { of, from } from 'rxjs';

describe('SearchInfrastructure', () => {
  let service: SearchInfrastructure;
  let openaiApiServiceMock: any;
  let articleServiceMock: any;
  let formServerResponseMock: any;
  let addImagesToChaptersMock: any;

  beforeEach(() => {
    // Mock pour le service OpenAI
    openaiApiServiceMock = {
      // Ajouter la méthode fetchData manquante
      fetchData: jasmine.createSpy('fetchData').and.returnValue(Promise.resolve({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Article généré',
                content: 'Contenu de l\'article',
                // Ajoutez d'autres propriétés selon votre structure d'article
              })
            }
          }
        ]
      }))
    };

    // Mock pour les autres services
    articleServiceMock = jasmine.createSpyObj('ArticleService', ['searchArticle', 'selectArticle']);
    formServerResponseMock = jasmine.createSpyObj('FormatInStructureService', ['formatArticleResponse']);
    addImagesToChaptersMock = jasmine.createSpyObj('AddImagesToChaptersService', ['addImages']);

    // Configuration des retours des mocks
    articleServiceMock.searchArticle.and.returnValue(of([]));
    articleServiceMock.selectArticle.and.returnValue(of({ url: 'test-url' }));
    formServerResponseMock.formatArticleResponse.and.returnValue(of({ title: 'Article formaté' }));
    addImagesToChaptersMock.addImages.and.returnValue(of({ title: 'Article avec images' }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SearchInfrastructure,
        { provide: 'ArticleService', useValue: articleServiceMock },
        { provide: 'OpenAIApiService', useValue: openaiApiServiceMock },
        { provide: 'FormatInStructureService', useValue: formServerResponseMock },
        { provide: 'AddImagesToChaptersService', useValue: addImagesToChaptersMock }
      ]
    });

    service = TestBed.inject(SearchInfrastructure);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ... autres tests ...

  it('devrait retourner un article généré', (done) => {
    const urlTest = 'http://example.com/article';

    service.generateArticle(urlTest).subscribe(result => {
      // Vérifier que fetchData a été appelé
      expect(openaiApiServiceMock.fetchData).toHaveBeenCalled();

      // Vérifier que formatArticleResponse a été appelé
      expect(formServerResponseMock.formatArticleResponse).toHaveBeenCalled();

      // Vérifier que addImages a été appelé
      expect(addImagesToChaptersMock.addImages).toHaveBeenCalled();

      // Vérifier le résultat final
      expect(result).toBeTruthy();
      // Vous pouvez ajouter d'autres assertions sur le résultat si nécessaire

      done();
    });
  });
});
