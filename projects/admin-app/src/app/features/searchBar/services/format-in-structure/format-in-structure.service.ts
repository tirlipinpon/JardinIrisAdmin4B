import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, from, mergeMap, Observable, of, switchMap, take, toArray} from "rxjs";
import {extractChapitreById, replaceChapitreById} from "../../../../utils/exctractChapitreById";
import {map} from "rxjs/operators";
import {extractJSONBlock, parseJsonSafe} from "../../../../utils/cleanJsonObject";
import {OpenaiApiService} from "../openai-api/openai-api.service";
import {GetPromptsService} from "../get-prompts/get-prompts.service";
import {InsertInternalLinkService} from "../add-internal-link/insert-internal-link.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const openaiApiService = inject(OpenaiApiService);
    const getPromptsService = inject(GetPromptsService);
    const insertInternalLinkService = inject(InsertInternalLinkService);

    return new FormatInStructureService(openaiApiService, getPromptsService, insertInternalLinkService);
  }
})
export class FormatInStructureService {

  constructor(private openaiApiService: OpenaiApiService
             ,private getPromptsService: GetPromptsService
             ,private insertInternalLinkService: InsertInternalLinkService) { }

  formatInStructure(article: string, type: string, postTitreAndId?: {titre: string, id: number, new_href: string}[]): Observable<string> {
    const chapitreIds = [1, 2, 3, 4, 5, 6];
    const postTitreAndId$ = new BehaviorSubject(postTitreAndId ? [...postTitreAndId] : []);

    // Créer un Observable pour chaque traitement de chapitre
    const chapitreObservables = chapitreIds.map(chapitreId => {
      // Extraire le chapitre actuel
      const chapitreText = extractChapitreById(article, chapitreId);

      return postTitreAndId$.pipe(
        take(1),
        switchMap(postTitreAndIdLocal => {
          let prompt: any;
          if (type === 'HTML') {
            prompt = this.getPromptsService.formatInHtmlArticle(chapitreText);
          } else if (type === 'UPGRADE') {
            prompt = this.getPromptsService.upgradeArticle(chapitreText);
          } else if (type === 'LINK') {
            prompt = this.getPromptsService.getPromptGenericAddInternalLinkInArticle(chapitreText, postTitreAndIdLocal);
          } else if (type === 'VEGETAL') {
            prompt = this.getPromptsService.getPromptAddVegetalInArticle(chapitreText, chapitreId);
          }

      // Convertir la Promise en Observable et traiter le résultat
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(upgradedText => {
          if (!upgradedText) {
            return {
              id: chapitreId,
              nouveauContenu: chapitreText
            };
          }

          try {
            const upgradedTextJson: {upgraded: string,idToRemove?: number} = JSON.parse(extractJSONBlock(upgradedText));
            let upgradedTextJsonObject = upgradedTextJson.upgraded;

                if (type === 'LINK' && upgradedTextJson.idToRemove) {
                  const idToRemove = Number(upgradedTextJson.idToRemove);
                  const updatedList = postTitreAndIdLocal.filter(item => item.id !== idToRemove);
                  postTitreAndId$.next(updatedList);
                } else if (type === 'HTML' && chapitreId === 3) {
                  upgradedTextJsonObject = this.insertInternalLinkService.addLink(upgradedTextJsonObject);
                }

                return {
                  id: chapitreId,
                  nouveauContenu: upgradedTextJsonObject
                };
              } catch (error) {
                console.error(`Erreur lors du traitement de la réponse pour le chapitre ${chapitreId}:`, error);
                return {
                  id: chapitreId,
                  nouveauContenu: chapitreText
                };
              }
            }),
            catchError(error => {
              console.error(`Erreur lors de l'appel API pour le chapitre ${chapitreId}:`, error);
              return of({
                id: chapitreId,
                nouveauContenu: chapitreText
              });
            })
          );
        })
      );
    });

    // Exécuter tous les appels en parallèle et assembler l'article final
    return from(chapitreObservables).pipe(
      mergeMap(obs => obs, 6), // Traitement parallèle avec max 6 appels simultanés
      toArray(),
      map(resultats => {
        let articleModifie = article;
        // Remplacer chaque chapitre par sa version traitée
        resultats.forEach(resultat => {
          articleModifie = replaceChapitreById(articleModifie, resultat.id, resultat.nouveauContenu);
        });
        return articleModifie;
      })
    );
  }


}
