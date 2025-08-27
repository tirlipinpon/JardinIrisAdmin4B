import {inject, Injectable} from '@angular/core';
import {catchError, concatMap, from, Observable, of, toArray} from "rxjs";
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
    let postTitreAndIdLocal = postTitreAndId ? [...postTitreAndId] : [];

    return from(chapitreIds).pipe(
      concatMap(chapitreId => {
        const chapitreText = extractChapitreById(article, chapitreId);

        let prompt: any;
        if (type === 'HTML') {
          prompt = this.getPromptsService.formatInHtmlArticle(chapitreText);
        } else if (type === 'UPGRADE') {
          prompt = this.getPromptsService.upgradeArticle(chapitreText);
        } else if (type === 'LINK') {
          prompt = this.getPromptsService.addInternalLinkInArticle(chapitreText, postTitreAndIdLocal);
        } else if (type === 'VEGETAL') {
          prompt = this.getPromptsService.getPromptAddVegetalInArticle(chapitreText, chapitreId);
        }

        return from(this.openaiApiService.fetchData(prompt, (type !== 'UPGRADE'))).pipe(
          map(upgradedText => {
            if (!upgradedText) {
              return {
                id: chapitreId,
                nouveauContenu: chapitreText
              };
            }

            try {
              const upgradedTextJson: { upgraded: string, idToRemove?: number } = JSON.parse(extractJSONBlock(upgradedText));
              let upgradedTextJsonObject = upgradedTextJson.upgraded;

              if (type === 'LINK' && upgradedTextJson.idToRemove) {
                const idToRemove = Number(upgradedTextJson.idToRemove);
                console.log(`ID retiré de la liste : ${idToRemove}`);
                postTitreAndIdLocal = postTitreAndIdLocal.filter(item => item.id !== idToRemove);
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
      }),
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
