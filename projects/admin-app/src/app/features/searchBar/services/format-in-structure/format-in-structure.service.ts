import {inject, Injectable} from '@angular/core';
import {catchError, from, mergeMap, Observable, of, toArray} from "rxjs";
import {extractChapitreById, replaceChapitreById} from "../../../../utils/exctractChapitreById";
import {map} from "rxjs/operators";
import {extractJSONBlock, parseJsonSafe} from "../../../../utils/cleanJsonObject";
import {OpenaiApiService} from "../openai-api/openai-api.service";
import {GetPromptsService} from "../get-prompts/get-prompts.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const openaiApiService = inject(OpenaiApiService);
    const getPromptsService = inject(GetPromptsService);

    return new FormatInStructureService(openaiApiService, getPromptsService);
  }
})
export class FormatInStructureService {

  constructor(private openaiApiService: OpenaiApiService
    , private getPromptsService: GetPromptsService) { }

  formatInStructure(article: string, type: string, postTitreAndId?: {
    titre: string,
    id: number
  }[]): Observable<string> {
    // Identifier les chapitres à traiter
    const chapitreIds = [1,2,3,4,5,6];
    // Copie locale de postTitreAndId pour pouvoir la modifier
    let postTitreAndIdLocal = postTitreAndId ? [...postTitreAndId] : undefined;

    // Créer un Observable pour chaque traitement de chapitre
    const chapitreObservables = chapitreIds.map(chapitreId => {
      // Extraire le chapitre actuel
      const chapitreText = extractChapitreById(article, chapitreId);

      // Sélectionner le prompt approprié selon le type
      let prompt: any;
      if (type === 'HTML') {
        prompt = this.getPromptsService.formatInHtmlArticle(chapitreText);
      } else if (type === 'UPGRADE') {
        prompt = this.getPromptsService.upgradeArticle(chapitreText);
      } else if (type === 'LINK') {
        prompt = this.getPromptsService.getPromptGenericAddInternalLinkInArticle(chapitreText, postTitreAndIdLocal);
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
            const upgradedTextJson: {
              upgraded: string,
              idToRemove?: number
            } = JSON.parse(extractJSONBlock(upgradedText));
            const upgradedTextJsonObject = upgradedTextJson.upgraded;

            // Mettre à jour postTitreAndIdLocal si nécessaire
            if (type === 'LINK' && postTitreAndIdLocal && upgradedTextJson.idToRemove) {
              const idToRemove = Number(upgradedTextJson.idToRemove);
              postTitreAndIdLocal = postTitreAndIdLocal.filter((item) => item.id !== idToRemove);
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
