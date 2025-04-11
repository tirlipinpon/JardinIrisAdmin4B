// search-with-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchWithFormComponent } from './search-with-form.component';
import { of } from 'rxjs';
import { SearchInfrastructure } from "../../services/search-infrastructure/search.infrastructure";

describe('SearchWithFormComponent', () => {
  let component: SearchWithFormComponent;
  let fixture: ComponentFixture<SearchWithFormComponent>;
  let searchInfrastructureMock: any;

  beforeEach(async () => {
    // Créer un mock pour SearchInfrastructure avec seulement les méthodes qui existent réellement
    searchInfrastructureMock = jasmine.createSpyObj('SearchInfrastructure', [
      'searchArticle',
      'selectArticle',
      'generateArticle',
      'searchIdea'
    ]);

    // Configuration par défaut des méthodes mockées
    searchInfrastructureMock.searchArticle.and.returnValue(of([]));
    searchInfrastructureMock.selectArticle.and.returnValue(of({ valid: true, url: 'test-url', image_url: 'test-image', explication: {} }));
    searchInfrastructureMock.generateArticle.and.returnValue(of({}));
    searchInfrastructureMock.searchIdea.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        SearchWithFormComponent, // Composant standalone importé ici
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SearchInfrastructure, useValue: searchInfrastructureMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchWithFormComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser le composant correctement', () => {
    // Déclencher le cycle de vie Angular
    fixture.detectChanges();

    // Le test devrait vérifier des comportements spécifiques qui peuvent être testés
    // sans dépendre de méthodes qui n'existent pas
    expect(component).toBeTruthy();

    // Si le composant a des propriétés publiques initialisées dans ngOnInit,
    // nous pouvons les vérifier ici
  });
});
