import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TheNewsApiService } from '../../features/searchBar/services/the-news-api.service';
import {SearchInfrastructure} from "../../shared/search-infrastructure/search.infrastructure";
import {SearchApplication} from "../../features/searchBar/services/search.application";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        HttpClientTestingModule
      ],
      providers: [
        SearchApplication,
        SearchInfrastructure,
        TheNewsApiService,
        provideHttpClient()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
