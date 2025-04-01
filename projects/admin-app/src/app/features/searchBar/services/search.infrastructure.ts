import {inject, Injectable} from "@angular/core";
import {catchError, EMPTY, from, Observable, of, tap, throwError} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {extractJSONBlock, parseJsonSafe} from "../../../utils/cleanJsonObject";
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

  selectArticle(articles: { url: string; image_url: string }[]): Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }> {
    const prompt = this.getPromptsService.selectArticle(articles);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }

        // Extraction et parsing du JSON depuis la chaîne retournée
        try {
          const jsonData = extractJSONBlock(result);
          const parsedData = JSON.parse(jsonData);

          return {
            valid: parsedData.valid,
            explication: parsedData.explication,
            url: parsedData.url,
            image_url: parsedData.image_url
          };
        } catch (error) {
          console.error('Erreur lors du parsing du résultat:', error);
          throw new Error('Impossible de parser le résultat de l\'API OpenAI');
        }
      })
    );
    // return new Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }>(subscriber => {
    //   const mock = {
    //     valid: Math.random() > 0.5,
    //     explication: { raisonArticle1: "Pourquoi cet article est pertinent ou non pertinent pour le blog de jardinier en Belgique." },
    //     url: articleValid[0].url,
    //     image_url: articleValid[0].image_url
    //     };
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
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

  generateArticle(url_post?: string): Observable<Post> {
    // const prompt = this.getPromptsService.generateArticle(url_post);
    // return from(this.openaiApiService.fetchData(prompt, true)).pipe(
    //   map(result => {
    //     if (result === null) {
    //       throw new Error('Aucun résultat retourné par l\'API OpenAI');
    //     }
    //     return parseJsonSafe(extractJSONBlock(result)) ;
    //   })
    // );

    return new Observable<Post>(subscriber => {
      const mock = {
        "titre": "Transformer votre toit en oasis urbaine",
          "phrase_accroche": "Découvrez comment aménager un jardin sur votre toit en plein cœur de la ville, un projet écologique et esthétique pour reverdir Bruxelles tout en profitant d'un espace vert unique.",
          "article": "<h4>Pourquoi un jardin sur le toit ?</h4><ul><li>Quels sont les avantages d'un toit végétalisé ?</li></ul><div id=\"paragraphe-1\"><p>Aménager un jardin sur le toit en milieu urbain offre de nombreux avantages, tant écologiques que pratiques. En plus de créer un espace vert supplémentaire, ces jardins contribuent à la biodiversité en offrant un refuge pour les insectes pollinisateurs et les oiseaux. Ils améliorent également la qualité de l'air en absorbant les polluants et en produisant de l'oxygène. Sur le plan thermique, ils isolent les bâtiments, réduisant ainsi les besoins en chauffage l'hiver et en climatisation l'été. Pour les habitants, c'est l'occasion de disposer d'un espace de détente ou même de cultiver ses propres légumes en plein cœur de la ville. À Bruxelles, où l'espace est limité, ces jardins représentent une solution innovante pour reverdir la ville tout en répondant aux enjeux climatiques actuels. Et qui n'a jamais rêvé d'un coin de verdure personnel avec vue sur les toits ?</p></div><h4>Les étapes clés pour votre projet</h4><ul><li>Comment débuter son jardin de toit ?</li></ul><div id=\"paragraphe-2\"><p>Avant de vous lancer dans l'aménagement d'un jardin sur votre toit, plusieurs étapes sont indispensables. Tout d'abord, vérifiez la capacité portante de votre toiture avec un professionnel, car les substrats et plantes ajoutent un poids considérable. Ensuite, pensez à l'étanchéité : une membrane spéciale protègera votre bâtiment des infiltrations. Le choix des plantes est crucial : privilégiez des espèces résistantes au vent et nécessitant peu d'entretien, comme les sedums ou certaines aromatiques. Pour le substrat, optez pour un mélange léger spécial toitures végétalisées. N'oubliez pas l'accès à l'eau pour l'arrosage, surtout les premières années. À Bruxelles, certaines communes proposent même des subsides pour ce type de projet écologique. Et si vous manquez d'inspiration, pourquoi ne pas visiter les toits végétalisés déjà existants dans la capitale ?</p></div><h4>Les défis techniques à anticiper</h4><ul><li>Quels obstacles peut-on rencontrer ?</li></ul><div id=\"paragraphe-3\"><p>Créer un jardin sur son toit n'est pas sans défis techniques. Le vent peut être beaucoup plus fort en hauteur, nécessitant parfois des brise-vents ou le choix de plantes résistantes. L'exposition au soleil est souvent plus intense qu'au sol, demandant un arrosage adapté. L'accès à l'eau peut poser problème, surtout en été : pensez à des systèmes de récupération d'eau de pluie. Le poids est une contrainte majeure : une toiture extensive (peu épaisse) conviendra mieux aux structures légères qu'un jardin intensif (plus épais). En ville, les règlements d'urbanisme peuvent imposer des restrictions, mieux vaut se renseigner auprès de sa commune. Et n'oubliez pas que même en hauteur, les nuisibles comme les pucerons ou les limaces peuvent trouver le chemin de vos plantations !</p></div><h4>Des idées d'aménagement créatives</h4><ul><li>Comment personnaliser son jardin de toit ?</li></ul><div id=\"paragraphe-4\"><p>Votre jardin sur le toit peut devenir bien plus qu'une simple étendue verte. Pour les petits espaces, les jardins en bac ou les murs végétaux optimisent la surface. Un coin potager permet de cultiver tomates, fraises ou aromates avec une vue imprenable. Ajoutez des sièges et une table pour créer un espace détente original. Les bruxellois apprécieront peut-être un coin « bière artisanale » avec houblon et plantes à infusion. Pour la biodiversité, installez un hôtel à insectes ou une petite mare (si la structure le permet). L'éclairage solaire prolongera les soirées estivales. Et pourquoi ne pas imaginer un petit verger avec des arbres nains ? Après tout, qui a dit qu'on ne pouvait pas avoir de pommiers sur son toit à Bruxelles ?</p></div><h4>L'entretien : plus simple qu'il n'y paraît</h4><ul><li>Comment maintenir son jardin de toit facilement ?</li></ul><div id=\"paragraphe-5\"><p>Contrairement aux idées reçues, un jardin sur le toit demande souvent moins d'entretien qu'un jardin traditionnel. Les plantes choisies sont généralement résistantes et adaptées aux conditions difficiles. Un désherbage occasionnel et un arrosage modéré suffisent la plupart du temps. Au printemps, un apport d'engrais organique peut être bénéfique. Pour les toitures extensives, une visite annuelle de contrôle de l'étanchéité est recommandée. En hiver, laissez faire la nature : les plantes entreront en dormance. Pensez à prévoir un accès facile pour l'entretien, surtout si vous devez monter du matériel. Et si vous partez en vacances, pas de panique : ces jardins sont conçus pour résister à quelques jours sans soins. Après tout, même les plantes ont droit à un peu d'indépendance !</p></div><h4>L'impact écologique à Bruxelles</h4><ul><li>Comment ces jardins profitent-ils à la ville ?</li></ul><div id=\"paragraphe-6\"><p>À l'échelle de Bruxelles, les jardins sur les toits représentent une solution concrète pour lutter contre les îlots de chaleur urbains. Ils absorbent jusqu'à 50% des eaux pluviales, réduisant la pression sur les égouts lors des fortes pluies. Leur capacité à filtrer les particules fines améliore la qualité de l'air dans les rues environnantes. Ils créent des corridors écologiques pour la faune en milieu très urbanisé. Sur le plan social, ils offrent des espaces de convivialité et de détente précieux en ville. Certains projets bruxellois combinent même production maraîchère et insertion sociale. Avec la densification urbaine, ces jardins aériens pourraient bien devenir la norme plutôt que l'exception. Et si demain, les toits de Bruxelles rivalisaient de verdure avec ses nombreux parcs ?</p></div>",
          "citation": "\"Le jardinage est l'art qui utilise les fleurs et les plantes comme peinture et la terre comme toile.\" - Elizabeth Murray",
          "lien_url_article": {
            "lien1": "https://www.eco-jardinage.com/amenager-un-jardin-sur-le-toit-en-milieu-urbain/"
          },
        "categorie": "jardin"
      };

      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });

  }

  upgradeArticle(article: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mock =
        `${article}`;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });
  }

  formatInHtmlArticle(generatedArticle: string): Observable<string> {
    const prompt = this.getPromptsService.generateArticle(generatedArticle);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        return result;
      })
    );
   /* return new Observable<string>(subscriber => {
      const mock = `


    <span id="paragraphe-1">
        <h4>Chapitre 1 : Le réveil du sol – Techniques de régénération en MSV (Maraîchage sur Sol Vivant)</h4>
        <p>En Belgique, le mois de mars marque la fin des gelées et le réchauffement progressif du sol. C'est le moment idéal pour préparer la terre avant les semis. Le <strong>Maraîchage sur Sol Vivant (MSV)</strong> privilégie une approche naturelle :</p>
        <ul>
            <li><strong>Pas de labour</strong> pour préserver la vie microbienne.</li>
            <li><strong>Apport de matière organique</strong> (compost, BRF, engrais verts).</li>
            <li><strong>Couverts végétaux</strong> pour éviter l'érosion.</li>
        </ul>

        <h3>Comment appliquer le MSV chez soi ?</h3>
        <ol>
            <li><strong>Analyse du sol</strong> : Testez son pH et sa texture (argileuse, sableuse...).</li>
            <li><strong>Paillage</strong> : Utilisez des feuilles mortes ou de la paille pour nourrir les micro-organismes.</li>
            <li><strong>Semis d'engrais verts</strong> (phacélie, moutarde) pour enrichir naturellement la terre.</li>
        </ol>
        <p><em>Astuce belge</em> : Certaines fermes wallonnes proposent des ateliers sur le MSV – une bonne idée de sortie printanière !</p>
    </span>

    <span id="paragraphe-2">
    <div class="chapter">
        <h4>Chapitre 2 : L'hydrologie régénérative – Gérer l'eau intelligemment</h4>
        <p>Avec des étés de plus en plus secs et des pluies irrégulières, optimiser l'eau est crucial.</p>
        <h3>Solutions concrètes</h3>
        <ul>
            <li><strong>Les baissières</strong> (fossés d'infiltration) pour retenir l'eau.</li>
            <li><strong>Les Ollas</strong> (pots en terre cuite enterrés) pour un arrosage goutte-à-goutte naturel.</li>
            <li><strong>Récupération d'eau de pluie</strong> avec des cuves connectées à des systèmes d'irrigation.</li>
        </ul>
        <p><em>Exemple local</em> : Des maraîchers flamands utilisent des <strong>mares temporaires</strong> pour créer des microclimats humides.</p>
    </span>

    <span id="paragraphe-3">
        <h4>Chapitre 3 : La permaculture – Des écosystèmes autonomes</h4>
        <ul>
            <li><strong>Buttes de culture</strong> pour un meilleur drainage.</li>
            <li><strong>Associations de plantes</strong> (tomates + basilic, carottes + poireaux).</li>
            <li><strong>Zones de biodiversité</strong> (hôtels à insectes, haies comestibles).</li>
        </ul>
        <p><em>Inspiration belge</em> : Le projet <strong>"Le Début des Haricots"</strong> à Bruxelles montre comment intégrer la permaculture en ville.</p>
    </span>

    <span id="paragraphe-4"></span>
        <h4>Chapitre 4 : Les semis de mars – Quoi planter en Belgique ?</h4>
        <ul>
            <li><strong>Épinards, radis, petits pois</strong> (résistants au froid).</li>
            <li><strong>Pommes de terre</strong> (variétés précoces comme 'Charlotte').</li>
            <li><strong>Fleurs comestibles</strong> (capucines, bourrache) pour attirer les pollinisateurs.</li>
        </ul>
        <p><em>Erreurs à éviter</em> : Semer trop tôt les tomates (attendre mi-avril sous abri).</p>
    </span>

    <span id="paragraphe-5">
    <div class="chapter">
        <h4>Chapitre 5 : Le jardin paysager – Esthétique et fonctionnel</h4>
        <ul>
            <li><strong>Spirales d'aromatiques</strong> (économie d'espace + esthétique).</li>
            <li><strong>Jardins verticaux</strong> pour les petits espaces urbains.</li>
            <li><strong>Allées en bois ramial fragmenté (BRF)</strong> pour un aspect naturel.</li>
        </ul>
        <p><em>Tendance 2025</em> : Les <strong>jardins secs</strong> (xéropaysagisme) gagnent du terrain en Wallonie.</p>
    </span>

    <span id="paragraphe-6">
        <h2>Conclusion : Un jardin résilient et productif</h2>
        <h3>Récapitulatif des actions clés</h3>
        <ol>
            <li>Régénérer le sol avec du paillage et des engrais verts.</li>
            <li>Optimiser l'eau avec des Ollas et baissières.</li>
            <li>Adopter la permaculture pour moins d'entretien et plus de biodiversité.</li>
        </ol>
        <p><em>Prochaine étape</em> : Participer à des ateliers locaux (comme ceux proposés par <strong>Nature & Progrès Belgique</strong>) pour échanger avec d'autres passionnés.</p>
        <p><strong>Et vous, quelles techniques allez-vous essayer ce printemps ?</strong></p>

        <h3>Bonus</h3>
        <ul>
            <li><strong>Fiche pratique</strong> : Calendrier des semis pour la Belgique.</li>
            <li><strong>Interview</strong> d'un maraîcher en MSV en Flandre.</li>
        </ul>
    </span>
      `;
      setTimeout(() => {
        subscriber.next(mock);
        subscriber.complete();
      }, 1000);
    });*/
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

  addImagesInArticle(getPost: string, getPostId: number): Observable<{success: boolean}> {
    return of({success: true});
   // return from(this.addImagesToChaptersService.getKeyWordsFromChapitreInArticleAndSetImageUrl(getPost, getPostId));
  }

}
