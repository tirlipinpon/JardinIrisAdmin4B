import {inject, Injectable} from "@angular/core";
import {catchError, EMPTY, from, Observable, tap, throwError} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {extractJSONBlock} from "../../../utils/cleanJsonObject";
import {UnsplashImageService} from "./unsplash-image.service";
import {SupabaseService} from "./supabase/supabase.service";
import {PostgrestError} from "@supabase/supabase-js";
import {map} from "rxjs/operators";
import {Post} from "../../../types/post";
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

    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService, unsplashImageService, supabaseService, addImagesToChaptersService);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private unsplashImageService: UnsplashImageService
    , private supabaseService: SupabaseService
    , private addImagesToChaptersService: AddImagesToChaptersService
  ) {}

  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string  }[]> {
    // return this.theNewsApiService.getNewsApi(cptSearchArticle);
    return new Observable<{ url: string; image_url: string }[]>(subscriber => {
      const mock = cptSearchArticle === 0 ? [] : [];
      //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  selectArticle(articleValid: { url: string; image_url: string }[]): Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }> {
    return new Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }>(subscriber => {
      const mock = {
        valid: Math.random() > 0.5,
        explication: { raisonArticle1: "Pourquoi cet article est pertinent ou non pertinent pour le blog de jardinier en Belgique." },
        url: articleValid[0].url,
        image_url: articleValid[0].image_url
        };
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<{ id: number | null, description: string | null }> {
    return from(this.supabaseService.getFirstIdeaPostByMonth(new Date().getMonth()+1, new Date().getFullYear()))
      .pipe(
        map(result => {
          if ('id' in result) {
            return result;
          } else {
            console.error('Erreur lors de la récupération des idées:', result);
            throw result;
          }
        })
      );
    // return new Observable<string>(subscriber => {
    //   console.log(`Recherche d'idée dans le mois courrent`);
    //   const mock = `dummy idee recue`;
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
  }

  generateArticle(url_post?: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = url_post ?
        `
        ${url_post} => Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
        int un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre` :
                `
        Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
        int un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre.
        `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  upgradeArticle(article: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock =
        `Super Article => ${article}`;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  formatInHtmlArticle(generatedArticle: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = `
      <!-- Chapitre 1: Introduction à la Gestion Durable de l'Eau chez AB InBev -->
<span id="paragraphe-1">
  <h4>Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊</h4>
  <p>À Jupille, dans la région de Liège, la brasserie AB InBev a mis en place une initiative innovante pour purifier les eaux usées et les rendre potables. Cette démarche s'inscrit dans les objectifs mondiaux de développement durable de l'entreprise pour 2025. <b>Le bourgmestre de Liège, Willy Demeyer, a visité la brasserie pour constater les avancées de ce projet, accompagné de Steven Van Belleghem, directeur de la brasserie, et de Nikki Janssens, technologue de procédé chez De Watergroep</b>[1).</p>
</span>

<!-- Chapitre 2: Le Processus de Purification des Eaux Usées -->
<span id="paragraphe-2">
  <h4>Le Processus de Purification des Eaux Usées ⚗️</h4>
  <p>Depuis 2019, la brasserie de Jupille, en collaboration avec De Watergroep, purifie environ <b>400 000 m³ d'eau usée chaque année, soit l'équivalent de 160 piscines olympiques</b>. Cette eau, une fois purifiée, est rendue potable et réutilisée pour des applications techniques dans la brasserie. Ce système a également été utilisé pour purifier la bière périmée pendant la fermeture de l'horeca, respectant ainsi les normes environnementales en matière d'eau et permettant de décharger l'eau purifiée dans la Meuse[1).</p>
</span>

<!-- Chapitre 3: Réduction de l'Empreinte Hydrique des Brasseries -->
<span id="paragraphe-3">
  <h4>Réduction de l'Empreinte Hydrique des Brasseries 📉</h4>
  <p>La réduction de l'empreinte hydrique est un élément clé des objectifs de développement durable d'AB InBev. L'entreprise utilise l'approche des 5R (Reduce, Reuse, Recycle, Restore, Recover) pour améliorer la gestion des eaux. À Jupille et Louvain, environ <b>20% des eaux usées sont purifiées jusqu'au niveau potable pour être réutilisées dans les processus de brassage</b>. Cette approche a permis de diminuer le volume d'eau nécessaire pour produire un litre de bière de environ 40% en une quinzaine d'années[2][3).</p>
</span><br id="link_to_service">
    <div class="col-lg-12 col-md-12 col-sm-12 footer-column">
      <div class="footer-widget contact-widget">
        <div class="widget-content">
          <ul class="contact-info clearfix">
            <li class="p_relative d_block">
              <p class="fs_15">
                <a aria-label="link on web site jardin iri jardinier bruxelles" href="https://jardin-iris.be/jardinier-paysagiste-service/creation-amenagement-de-jardin.html" class="theme-btn btn-one" style="width: 100%; margin: 20px 0 20px 0; padding: 4px 0 5px 0;">
                  Visitez notre service de jardinage à thème écologie que nous proposons.
                </a>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>


<!-- Chapitre 4: Surveillance et Protection des Ressources en Eau -->
<span id="paragraphe-4">
  <h4>Surveillance et Protection des Ressources en Eau 🛡️</h4>
  <p>La brasserie de Jupille se concentre également sur la surveillance et la protection des ressources en eau. Une zone de protection des puits est mise en place pour éviter toute pollution des eaux de puits. Des consultations sont organisées pour tous les projets développés dans cette zone, garantissant ainsi la captation des eaux de puits. <b>Frédéric Leclerc, Responsable Technique Brassage et Energies & Fluides, a expliqué la méthode de calcul utilisée pour évaluer la consommation d'eau et le processus de fabrication de la bière</b>, mettant en évidence les postes les plus consommateurs d'eau[2).</p>
</span>

<!-- Chapitre 5: Impact Environnemental et Économique -->
<span id="paragraphe-5">
  <h4>Impact Environnemental et Économique 🌍</h4>
  <p>Les initiatives de AB InBev pour réduire l'empreinte hydrique ont des implications environnementales et économiques significatives. <b>L'utilisation rationnelle de l'eau est cruciale, et l'entreprise vise à protéger cette ressource naturelle</b>. Entre 2012 et 2020, la consommation d'eau en Belgique a diminué de 9% par litre de bière. Les coûts et les énergies consommées pour le recyclage sont pris en compte, mais les bénéfices environnementaux et économiques justifient ces investissements. L'entreprise se concentre également sur des objectifs sociétaux, comme l'atteinte de <b>100% d'électricité renouvelable et la réduction des émissions de CO2</b>[2][3).</p>
</span>

<!-- Chapitre 6: Initiatives Globales et Partenariats pour la Durabilité -->
<span id="paragraphe-6">
  <h4>Initiatives Globales et Partenariats pour la Durabilité 🌟</h4>
  <p>AB InBev engage des initiatives globales pour adresser les défis liés à l'eau. Entre 2017 et 2022, l'entreprise a réduit sa consommation d'eau de 14% et a atteint un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre. Des projets innovants, comme le traitement des eaux usées pour irriguer des cultures de spinach en Afrique du Sud ou la conservation des eaux dans le bassin de la rivière Jaguari au Brésil, démontrent l'engagement de l'entreprise dans la durabilité. Des partenariats avec des organisations comme <em>The Nature Conservancy</em> et <em>WaterAid India</em> renforcent ces efforts, contribuant ainsi à améliorer la disponibilité et la qualité de l'eau dans les communautés locales[4).</p>
  <p>Par exemple, la gestion durable de l'eau peut être comparée à la <a class="myTooltip" href="https://jardin-iris.be/blog-detail.html?post=492" id="492" title="Cultiver des champignons luminescents : créez un jardin nocturne magique">culture de champignons luminescents</a>, où l'eau joue un rôle crucial dans le maintien de l'écosystème.</p>
  <p>De plus, les initiatives de <a class="myTooltip" href="https://jardin-iris.be/blog-detail.html?post=466" id="466" title="Créez votre propre serre passive pour prolonger la saison de culture en Belgique">sérre passive</a> et de <a class="myTooltip" href="https://jardin-iris.be/blog-detail.html?post=507" id="507" title="Créer un Jardin en Permaculture">permaculture</a> montrent comment l'eau peut être gérée de manière durable dans différents contextes.</p>
  <p>Enfin, la protection des ressources en eau est essentielle, comme le démontre l'article sur la <a class="myTooltip" href="https://jardin-iris.be/blog-detail.html?post=456" id="456" title="Guide pratique pour créer un jardin de pluie et gérer les eaux de ruissellement en Belgique">gestion des eaux de ruissellement</a>.</p>
</span>
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  checkMeteo(): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock = `
      Ma météo est bonne 12 degrés.
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  savePost(post: Post): Observable<Post> {
    return from(this.supabaseService.setNewPostForm(post)).pipe(
      map(data => {
        if (data && data.length > 0) {
          return data[0]; // Retourne le premier élément du tableau
        }
        throw new Error('Aucune donnée retournée après l insertion');
      })
    );
  }

  updateIdeaPost(ideaPostId: number, postId: number): Observable<any> {
    return from(this.supabaseService.updateIdeaPostById(ideaPostId, postId));
    // return new Observable<string>(subscriber => {
    //   console.log(`Recherche d'idée dans le mois courrent`);
    //   const mock = `dummy idee recue`;
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
  }

  addImagesInArticle(getPost: string, getPostId: number): Observable<void> {
    console.log("Début addImagesInArticle", { getPostId });
    if (!getPost) {
      console.error("getPost est vide ou null");
      return EMPTY;
    }
    console.log("Avant appel à getKeyWordsFromChapitreInArticleAndSetImageUrl");

    return from(
      Promise.resolve().then(() => {
        try {
          return this.addImagesToChaptersService.getKeyWordsFromChapitreInArticleAndSetImageUrl(getPost, getPostId);
        } catch (e) {
          console.error("Erreur synchrone dans l'appel:", e);
          throw e;
        }
      })
    ).pipe(
      tap({
        next: (val) => console.log("Résultat obtenu:", val),
        error: (e) => console.error("Erreur dans l'Observable:", e),
        complete: () => console.log("Observable complété")
      }),
      catchError(err => {
        console.error("Erreur interceptée:", err);
        return throwError(() => err);
      }),
      map(() => undefined)
    );
  }

}
