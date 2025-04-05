import {inject, Injectable} from "@angular/core";
import {
  catchError,
  delay,
  EMPTY,
  from,
  mergeMap,
  Observable,
  of,
  retry,
  takeLast,
  tap,
  throwError,
  timer,
  toArray
} from "rxjs";
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
import {extractChapitreById, replaceChapitreById} from "../../../utils/exctractChapitreById";
import {compressImage} from "../../../utils/resizeB64JsonIMage";
import {FormatInStructureService} from "./format-in-structure.service";

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
    const formatInStructureService = inject(FormatInStructureService);
    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService, unsplashImageService, supabaseService, addImagesToChaptersService, formatInStructureService);
  }
})
export class SearchInfrastructure {
  textPromptImage= "créé moi une image avec peu d'éléments ', concentre toi sur le sujet que je vais te donner, car cette image vas allez comme illustration d'un blog, et ne met surtout aucun de texte sur l'image ni humain ou partie humaine , voici le sujet : "

  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private unsplashImageService: UnsplashImageService
    , private supabaseService: SupabaseService
    , private addImagesToChaptersService: AddImagesToChaptersService
    , private formatInStructureService: FormatInStructureService
  ) {}

  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string  }[]> {
    return this.theNewsApiService.getNewsApi(cptSearchArticle);
    // return new Observable<{ url: string; image_url: string }[]>(subscriber => {
    //   const mock = cptSearchArticle === 0 ? [] : [];
    //   //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
  }

  selectArticle(articles: { url: string; image_url: string }[]): Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }> {
    const prompt = this.getPromptsService.selectArticle(articles);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        try {
          const parsedData = JSON.parse(extractJSONBlock(result));
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
  }

  generateArticle(url_post?: string): Observable<Post> {
    const prompt = this.getPromptsService.generateArticle(url_post);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        return parseJsonSafe(extractJSONBlock(result)) ;
      })
    );
    // return new Observable<Post>(subscriber => {
    //   const mock = {
    //     "titre": "Transformer votre toit en oasis urbaine",
    //       "phrase_accroche": "Découvrez comment aménager un jardin sur votre toit en plein cœur de la ville, un projet écologique et esthétique pour reverdir Bruxelles tout en profitant d'un espace vert unique.",
    //       "article": `<span id="paragraphe-1"><h4>Qu'est-ce qu'un jardin de pluie ?</h4><ul><li>Pourquoi créer un jardin de pluie ?</li></ul><p>Un jardin de pluie est une dépression peu profonde plantée de végétaux adaptés, conçue pour absorber et filtrer les eaux pluviales. Situé généralement en aval d'une surface imperméable (toit, allée), il permet de retenir temporairement l'eau avant qu'elle ne s'infiltre naturellement dans le sol. Cette solution écologique réduit les risques d'inondation, recharge les nappes phréatiques et filtre les polluants. À Bruxelles, où les surfaces imperméabilisées sont nombreuses, ces jardins jouent un rôle crucial dans la gestion durable des eaux pluviales. Ils offrent également un habitat pour la biodiversité locale et embellissent les espaces urbains. Contrairement aux idées reçues, un jardin de pluie n'est pas une mare permanente : l'eau ne stagne que quelques heures après la pluie. C'est donc une solution à la fois pratique et esthétique pour nos régions tempérées.</p></span><span id="paragraphe-2"><h4>Les multiples avantages écologiques</h4><ul><li>Comment contribue-t-il à l'environnement ?</li></ul><p>Le jardin de pluie présente de nombreux bénéfices environnementaux. D'abord, il réduit la charge sur les réseaux d'égouttage, limitant les débordements en cas de fortes précipitations. Ensuite, il filtre naturellement les polluants (hydrocarbures, métaux lourds) avant qu'ils n'atteignent les cours d'eau. Les plantes et le sol agissent comme un filtre biologique, améliorant ainsi la qualité de l'eau. De plus, cette technique permet de recharger les nappes phréatiques, cruciales en période de sécheresse. En ville, ces jardins contribuent à rafraîchir l'air ambiant et à lutter contre les îlots de chaleur. Ils créent aussi des corridors écologiques pour la faune urbaine. Enfin, ils réduisent l'érosion des sols en ralentissant le ruissellement. Une solution polyvalente qui fait du bien à la planète tout en embellissant nos quartiers !</p></span><span id="paragraphe-3"><h4>Comment concevoir son jardin de pluie</h4><ul><li>Par où commencer son projet ?</li></ul><p>La conception d'un jardin de pluie nécessite quelques précautions. D'abord, choisissez un emplacement naturellement humide, à au moins 3 mètres des fondations et 30 mètres des puits. La taille dépend de la surface de toiture ou d'imperméabilisation à drainer : comptez environ 10-20% de cette surface. Creusez une dépression de 15-30 cm de profondeur avec des bords en pente douce. Le sol idéal est un mélange de 50-60% de sable, 20-30% de terre végétale et 20% de compost. Positionnez l'entrée d'eau (gouttière ou drain) au point le plus haut. Pour l'esthétique, variez les formes et intégrez des pierres ou des rondins comme éléments décoratifs. Pensez aussi à prévoir un trop-plein vers le réseau d'eaux pluviales en cas de très fortes pluies. Avec ces bases, vous êtes prêt à passer à l'étape suivante : le choix des plantes !</p></span><span id="paragraphe-4"><h4>Choisir les bonnes plantes</h4><ul><li>Quelles espèces privilégier ?</li></ul><p>Le choix des végétaux est crucial pour un jardin de pluie réussi. Privilégiez des espèces indigènes adaptées aux alternances d'humidité et de sécheresse. Pour la zone la plus humide (fond du jardin), optez pour des plantes hydrophiles comme les iris des marais, les salicaires ou les menthes aquatiques. La zone intermédiaire accueillera des espèces tolérantes comme les eupatoires ou les rudbeckies. En périphérie, choisissez des plantes plus résistantes à la sécheresse une fois établies. À Bruxelles, pensez aux espèces locales comme la reine-des-prés ou la digitale pourpre. Variez les hauteurs, textures et périodes de floraison pour un effet esthétique toute l'année. Évitez les espèces invasives comme la renouée du Japon. Un bon mélange comprend 50% de plantes vivaces, 30% de graminées et 20% d'arbustes. N'oubliez pas que même les plantes adaptées ont besoin d'un an pour bien s'installer avant de montrer leur plein potentiel.</p></span><span id="paragraphe-5"><h4>Entretien et bonnes pratiques</h4><ul><li>Comment maintenir son jardin de pluie ?</li></ul><p>Contrairement aux idées reçues, un jardin de pluie bien conçu demande peu d'entretien. La première année, arrosez régulièrement pour aider à l'installation des plantes. Désherbez manuellement pour éviter la concurrence avec les espèces indésirables. Au printemps, coupez les tiges sèches et divisez les plantes trop envahissantes. Surveillez l'accumulation de sédiments à l'entrée d'eau et nettoyez si nécessaire. Évitez les engrais chimiques qui pourraient polluer les eaux infiltrées. En automne, laissez les feuilles mortes sur place : elles forment un paillis naturel. Tous les 3-5 ans, vérifiez la perméabilité du sol et ajoutez du compost si besoin. En cas de moustiques (rare si l'eau ne stagne pas longtemps), introduisez des prédateurs naturels comme les libellules. Avec ces simples gestes, votre jardin de pluie fonctionnera efficacement pendant des années, devenant même plus beau avec le temps !</p></span><span id="paragraphe-6"><h4>Un projet citoyen à Bruxelles</h4><ul><li>Comment s'impliquer localement ?</li></ul><p>À Bruxelles, plusieurs initiatives encouragent la création de jardins de pluie. La région propose parfois des subsides pour les projets privés ou collectifs. Des ateliers pratiques sont organisés par des associations comme Bruxelles Environnement. Certains quartiers ont transformé des espaces publics en jardins de pluie communautaires, combinant utilité écologique et convivialité. Les écoles aussi s'y mettent, intégrant ces aménagements dans des projets pédagogiques. Pour votre projet, renseignez-vous auprès de votre commune sur les éventuelles réglementations. Participer à ces initiatives permet d'échanger des plantes, des conseils et de créer du lien entre voisins. Et pourquoi ne pas imaginer un réseau de petits jardins de pluie à l'échelle d'une rue ? Chaque goutte compte dans la gestion durable de l'eau en ville. Alors, prêt à transformer la pluie en or vert ?</p></span>`,
    //       "citation": "\"Le jardinage est l'art qui utilise les fleurs et les plantes comme peinture et la terre comme toile.\" - Elizabeth Murray",
    //       "lien_url_article": {
    //         "lien1": "https://www.eco-jardinage.com/amenager-un-jardin-sur-le-toit-en-milieu-urbain/"
    //       },
    //     "categorie": "jardin"
    //   };
    //
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
  }

  formatInStructure(article: string, type: string, postTitreAndId?: {titre:string, id: number}[]): Observable<string> {
    // return this.formatInStructureService.formatInStructure(article, type);
    // return new Observable<string>(subscriber => {
    //   const mock = `<h4>Pourquoi un jardin sur le toit ?</h4><ul><li>Quels sont les avantages d'un toit végétalisé ?</li></ul><div id="paragraphe-1"><p>Aménager un jardin sur le toit en milieu urbain offre de nombreux avantages, tant écologiques que pratiques. En plus de créer un espace vert supplémentaire, ces jardins contribuent à la biodiversité en offrant un refuge pour les insectes pollinisateurs et les oiseaux. Selon une étude de l'Université de Toronto, un toit végétalisé de 100 m² peut accueillir jusqu'à 10 espèces d'abeilles sauvages et augmenter la présence d'oiseaux de 40% dans un rayon de 500 mètres. Ils améliorent également la qualité de l'air en absorbant les polluants (jusqu'à 0,2 kg de particules fines par m²/an) et en produisant de l'oxygène (un jardin de toit moyen produit autant d'oxygène que 5 arbres adultes). Sur le plan thermique, ils isolent les bâtiments, réduisant ainsi les besoins en chauffage l'hiver (jusqu'à 25% d'économie) et en climatisation l'été (diminution de 5°C de la température intérieure). Pour les habitants, c'est l'occasion de disposer d'un espace de détente ou même de cultiver ses propres légumes en plein cœur de la ville (un potager sur toit de 10m² peut produire jusqu'à 50kg de légumes par saison). À Bruxelles, où l'espace est limité, ces jardins représentent une solution innovante pour reverdir la ville tout en répondant aux enjeux climatiques actuels. La capitale belge compte déjà plus de 30 hectares de toits végétalisés, avec un objectif d'atteindre 50 hectares d'ici 2025. Et qui n'a jamais rêvé d'un coin de verdure personnel avec vue sur les toits ?</p></div><h4>Les étapes clés pour votre projet</h4><ul><li>Comment débuter son jardin de toit ?</li></ul><div id="paragraphe-2"><p>Avant de vous lancer dans l'aménagement d'un jardin sur votre toit, plusieurs étapes sont indispensables. Tout d'abord, vérifiez la capacité portante de votre toiture avec un professionnel, car les substrats et plantes ajoutent un poids considérable – en moyenne, un jardin sur toit pèse entre 150 et 500 kg/m² une fois saturé d'eau. Ensuite, pensez à l'étanchéité : une membrane EPDM ou PVC (épaisseur minimale de 1,2 mm) protègera durablement votre bâtiment des infiltrations. Le choix des plantes est crucial : privilégiez des espèces résistantes au vent (vitesses pouvant atteindre 100 km/h en ville) et nécessitant peu d'entretien, comme les sedums (couvrant 80% des toits végétalisés extensifs) ou certaines aromatiques (thym, romarin). Pour le substrat, optez pour un mélange léger (max. 900 kg/m³) spécial toitures végétalisées, composé à 70% de matériaux minéraux. N'oubliez pas l'accès à l'eau pour l'arrosage (comptez 10-20 litres/m²/semaine en été), surtout les 2-3 premières années. À Bruxelles, 7 communes sur 19 proposent des subsides jusqu'à 50€/m² pour ce type de projet écologique, avec +35% de surfaces végétalisées enregistrées depuis 2020. Et si vous manquez d'inspiration, pourquoi ne pas visiter les 18 ha de toits végétalisés recensés dans la capitale, comme ceux du Musée des Sciences Naturelles ou de la Bibliothèque Solvay ?</p></div><h4>Les défis techniques à anticiper</h4><ul><li>Quels obstacles peut-on rencontrer ?</li></ul><div id="paragraphe-3"><p>Créer un jardin sur son toit n'est pas sans défis techniques. Le vent peut être jusqu'à 30% plus fort en hauteur qu'au niveau du sol, nécessitant parfois des brise-vents efficaces (comme des treillis ou des arbustes bas résistants) ou le choix de plantes adaptées comme les sedums ou les graminées. L'exposition au soleil est souvent plus intense qu'au sol, avec des UV jusqu'à 15% plus élevés, ce qui demande un arrosage adapté : un système goutte-à-goutte automatisé peut réduire la consommation d'eau de 50% par rapport à un arrosage manuel. L'accès à l'eau peut poser problème, surtout en été où les besoins hydriques augmentent de 40% : pensez à des systèmes de récupération d'eau de pluie (un toit de 50m² peut collecter jusqu'à 30 000 litres d'eau par an). Le poids est une contrainte majeure : une toiture extensive (15-20 cm d'épaisseur, charge de 60-150 kg/m²) conviendra mieux aux structures légères qu'un jardin intensif (plus de 30 cm, charge supérieure à 300 kg/m²). En ville, 75% des communes imposent des restrictions spécifiques pour les toits végétalisés, mieux vaut se renseigner auprès de sa mairie avant tout projet. Et n'oubliez pas que même en hauteur, les nuisibles comme les pucerons (qui peuvent infester un toit en 48h) ou les limaces (capables de grimper 3 étages) peuvent trouver le chemin de vos plantations !</p></div><h4>Des idées d'aménagement créatives</h4><ul><li>Comment personnaliser son jardin de toit ?</li></ul><div id="paragraphe-4"><p>Votre jardin sur le toit peut devenir bien plus qu'une simple étendue verte. Pour les petits espaces (moins de 10 m²), les jardins en bac ou les murs végétaux optimisent la surface tout en réduisant l'effet d'îlot de chaleur urbain de 2 à 5°C selon une étude de la KU Leuven. Un coin potager permet de cultiver tomates (variétés naines comme 'Tumbling Tom' idéales en pots), fraises (1 plant produit en moyenne 500g/an) ou aromates (basilic, thym, romarin) avec une vue imprenable. Ajoutez des sièges et une table en teck imputrescible pour créer un espace détente original. Les Bruxellois apprécieront peut-être un coin « bière artisanale » avec houblon (rendement : 500g à 1kg par plant) et plantes à infusion (menthe, mélisse). Pour la biodiversité, installez un hôtel à insectes (attirant jusqu'à 30 espèces différentes) ou une petite mare préformée de 60L max (si la structure le permet, avec une charge de 60kg/m²). L'éclairage solaire (LED 5W couvrant 2m²) prolongera les soirées estivales. Et pourquoi ne pas imaginer un petit verger avec des arbres nains (pommiers colonnaires produisant 3-5kg/fruit/an) ? Après tout, Bruxelles compte déjà 15% de toits végétalisés selon Bruxelles Environnement.</p></div><h4>L'entretien : plus simple qu'il n'y paraît</h4><ul><li>Comment maintenir son jardin de toit facilement ?</li></ul><div id="paragraphe-5"><p>Contrairement aux idées reçues, un jardin sur le toit demande souvent moins d'entretien qu'un jardin traditionnel. Les plantes choisies, comme les sedums, les graminées ou les thyms, sont généralement résistantes et adaptées aux conditions difficiles (ensoleillement intense, vent, variations thermiques). Selon une étude de la Fédération Française du Paysage (2023), ces espèces nécessitent jusqu'à 70% moins d'eau qu'une pelouse classique. Un désherbage occasionnel (environ 2 à 3 fois par an) et un arrosage modéré (10 à 15 litres/m² par semaine en été) suffisent la plupart du temps. Au printemps, un apport d'engrais organique à libération lente (compost ou fumier déshydraté) peut être bénéfique pour stimuler la croissance. Pour les toitures extensives, une visite annuelle de contrôle de l'étanchéité est recommandée, avec un coût moyen de 150 à 300€ selon la surface. En hiver, laissez faire la nature : les plantes entreront en dormance et supporteront des températures jusqu'à -15°C pour les variétés les plus robustes. Pensez à prévoir un accès facile (échelle sécurisée ou trappe d'accès de 60x80cm minimum) pour l'entretien, surtout si vous devez monter du matériel. Et si vous partez en vacances, pas de panique : ces jardins sont conçus pour résister à 2-3 semaines sans soins en période estivale. Après tout, même les plantes ont droit à un peu d'indépendance !</p></div><h4>L'impact écologique à Bruxelles</h4><ul><li>Comment ces jardins profitent-ils à la ville ?</li></ul><div id="paragraphe-6"><p>À l'échelle de Bruxelles, les jardins sur les toits représentent une solution concrète pour lutter contre les îlots de chaleur urbains. Selon une étude de Bruxelles Environnement (2023), ces espaces verts peuvent réduire la température ambiante de 3 à 5°C en été. Ils absorbent jusqu'à 50% des eaux pluviales, réduisant la pression sur les égouts lors des fortes pluies, comme lors des intempéries de juillet 2021 où certains quartiers équipés ont évité des inondations. Leur capacité à filtrer les particules fines (jusqu'à 0,7 kg/m²/an selon l'ULB) améliore significativement la qualité de l'air dans les rues environnantes. Ils créent des corridors écologiques pour la faune en milieu très urbanisé, avec déjà 38 espèces d'abeilles sauvages recensées sur les toits végétalisés bruxellois. Sur le plan social, ils offrent des espaces de convivialité et de détente précieux en ville, comme le prouve le succès du toit-terrasse de la Cité Administrative (500 visiteurs/jour en moyenne). Certains projets bruxellois combinent même production maraîchère (comme le potager du toit de Tour & Taxis qui produit 2 tonnes de légumes bio annuellement) et insertion sociale (12 emplois créés en 2022). Avec la densification urbaine et le nouveau plan 'Bruxelles 2040' prévoyant 10ha supplémentaires de toits verts, ces jardins aériens pourraient bien devenir la norme plutôt que l'exception. Et si demain, les toits de Bruxelles rivalisaient de verdure avec ses nombreux parcs ? Le potentiel est immense : sur les 12km² de toitures plates bruxelloises, seulement 15% sont actuellement végétalisées.</p></div>`
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });

    return of(article).pipe(
      mergeMap(fullArticle => {
        const chapitreIds = [1, 2, 3, 4, 5, 6];
        // Traitement séquentiel de chaque chapitre
        return from(chapitreIds).pipe(
          mergeMap(chapitreId => {
            // Extraction du texte du chapitre
            const chapitreText = extractChapitreById(fullArticle, chapitreId);
            let prompt: any;
            if(type === 'HTML') {
              prompt = this.getPromptsService.formatInHtmlArticle(chapitreText);
            } else if(type === 'UPGRADE') {
              prompt = this.getPromptsService.upgradeArticle(chapitreText);
            } else if(type === 'LINK') {
              prompt = this.getPromptsService.getPromptGenericAddInternalLinkInArticle(chapitreText, postTitreAndId);
            }
            // Conversion de la Promise en Observable et traitement de l'amélioration
            return from(this.openaiApiService.fetchData(prompt, true)).pipe(
              map(upgradedText => {
                // Vérification que le texte amélioré est bien une chaîne
                if (upgradedText === null) {
                  console.warn(`Le chapitre ${chapitreId} n'a pas pu être amélioré, texte reçu:`, upgradedText);
                  return fullArticle; // Retourne l'article sans modifier ce chapitre
                }
                const upgradedTextJson: {upgraded: string, idToRemove?: number} = JSON.parse(extractJSONBlock(upgradedText))
                const upgradedTextJsonObject  = upgradedTextJson.upgraded
                if(type === 'LINK' && postTitreAndId && upgradedTextJson.idToRemove) {
                  const idToRemove  = Number(upgradedTextJson.idToRemove);
                  postTitreAndId =  postTitreAndId.filter((item) => item.id !== idToRemove);
                }
                // Remplacement du chapitre dans l'article complet
                fullArticle = replaceChapitreById(fullArticle, chapitreId, upgradedTextJsonObject);
                return fullArticle;
              }),
              catchError(error => {
                console.error(`Erreur lors de l'amélioration du chapitre ${chapitreId}:`, error);
                return of(fullArticle); // En cas d'erreur, on retourne l'article sans modification
              })
            );
          }, 1), // Traitement d'un chapitre à la fois
          // On ne s'intéresse qu'au dernier résultat qui contient l'article complet avec tous les chapitres améliorés
          takeLast(1)
        );
      })
    );
  }

  checkMeteo(): Observable<string> {
    const prompt = this.getPromptsService.meteoArticle();
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        const data: {meteo: string} = JSON.parse(extractJSONBlock(result))
        return data.meteo;
      })
    );
    // return new Observable<string>(subscriber => {
    //   const mock = `
    //   Ma météo est bonne 12 degrés.
    //   `;
    //   setTimeout(() => {
    //     subscriber.next(mock);
    //     subscriber.complete();
    //   }, 1000);
    // });
  }

  savePost(post: Post, getMeteo: string, getArticleHtml: string, image_url: string): Observable<Post> {
    const updatedPost: Post = {
      ...post,
      description_meteo: getMeteo,
      article: getArticleHtml,
      image_url: image_url,
    };
    return from(this.supabaseService.setNewPostForm(updatedPost)).pipe(
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
    // return of({success: true});
    return from(this.addImagesToChaptersService.getKeyWordsFromChapitreInArticleAndSetImageUrl(getPost, getPostId));
  }

  async generateImageIa(description: string, postId: number) {
    let image_url = await this.openaiApiService.imageGenerartor(this.getPromptsService.getOpenAiPromptImageGenerator(description));
    image_url = await compressImage(image_url, 500, 300)
    await this.supabaseService.updateImageUrlPostByIdForm(postId, image_url)
  }

  getPostTitreAndId(): Observable<{ titre: string; id: number }[]>  {
    return from(this.supabaseService.getPostTitreAndId())
  }

}
