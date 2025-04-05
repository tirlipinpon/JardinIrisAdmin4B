import {inject, Injectable} from '@angular/core';
import {catchError, from, mergeMap, Observable, of, toArray} from "rxjs";
import {extractChapitreById, replaceChapitreById} from "../../../utils/exctractChapitreById";
import {map} from "rxjs/operators";
import {extractJSONBlock, parseJsonSafe} from "../../../utils/cleanJsonObject";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {UnsplashImageService} from "./unsplash-image.service";
import {SupabaseService} from "./supabase/supabase.service";
import {AddImagesToChaptersService} from "./add-images-to-chapters.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    const openaiApiService = inject(OpenaiApiService);
    const perplexityApiService = inject(PerplexityApiService);
    const getPromptsService = inject(GetPromptsService);
    const unsplashImageService = inject(UnsplashImageService);
    const supabaseService = inject(SupabaseService);
    const addImagesToChaptersService = inject(AddImagesToChaptersService);

    return new FormatInStructureService(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService, unsplashImageService, supabaseService, addImagesToChaptersService);
  }
})
export class FormatInStructureService {

  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private unsplashImageService: UnsplashImageService
    , private supabaseService: SupabaseService
    , private addImagesToChaptersService: AddImagesToChaptersService) { }

  formatInStructure(article: string, type: string): Observable<string> {
    return of(article).pipe(
      mergeMap(fullArticle => {
        const chapitreIds = [1, 2, 3, 4, 5, 6];

        return from(chapitreIds).pipe(
          mergeMap(chapitreId => {
            const chapitreText = extractChapitreById(fullArticle, chapitreId);
            return this.processChapitreBasedOnType(chapitreText, chapitreId, type);
          }),
          toArray(),
          map(results => this.applyChangesToArticle(fullArticle, results))
        );
      })
    );
  }

  private processChapitreBasedOnType(chapitreText: string, chapitreId: number, type: string): Observable<{id: number, text: string}> {
    switch(type) {
      case 'LINK':
        return this.processLinkType(chapitreText, chapitreId);
      case 'UPGRADE':
        return this.processUpgradeType(chapitreText, chapitreId);
      case 'HTML':
        return this.processHtmlType(chapitreText, chapitreId);
      default:
        return of({ id: chapitreId, text: chapitreText });
    }
  }

  private processLinkType(chapitreText: string, chapitreId: number): Observable<{id: number, text: string}> {
    return from(this.supabaseService.getPostTitreAndId()).pipe(
      mergeMap(listTitreId => {
        const prompt = this.getPromptsService.getPromptGenericAddInternalLinkInArticle(chapitreText, listTitreId);
        return this.processPromptAndExtractResult(prompt, chapitreText, chapitreId, 'textWithLinks');
      })
    );
  }

  private processUpgradeType(chapitreText: string, chapitreId: number): Observable<{id: number, text: string}> {
    const prompt = this.getPromptsService.upgradeArticle(chapitreText);
    return this.processPromptAndExtractResult(prompt, chapitreText, chapitreId, 'textUpgraded');
  }

  private processHtmlType(chapitreText: string, chapitreId: number): Observable<{id: number, text: string}> {
    const prompt = this.getPromptsService.formatInHtmlArticle(chapitreText);
    return this.processPromptAndExtractResult(prompt, chapitreText, chapitreId, 'htmlContent');
  }

  private processPromptAndExtractResult(
    prompt: string,
    originalText: string,
    chapitreId: number,
    resultPropertyName: string
  ): Observable<{id: number, text: string}> {
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        const parsedData = parseJsonSafe(extractJSONBlock(result));
        return {
          id: chapitreId,
          text: parsedData[resultPropertyName]
        };
      }),
      catchError(error => {
        console.error(`Erreur lors du traitement du chapitre ${chapitreId}:`, error);
        return of({
          id: chapitreId,
          text: originalText
        });
      })
    );
  }

  private applyChangesToArticle(article: string, results: {id: number, text: string}[]): string {
    let newArticle = article;
    results.forEach(result => {
      newArticle = replaceChapitreById(newArticle, result.id, result.text);
    });
    return newArticle;
  }
}
