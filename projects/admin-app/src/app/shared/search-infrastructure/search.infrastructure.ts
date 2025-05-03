import {inject, Injectable} from "@angular/core";
import {
  from,
  Observable, of, switchMap
} from "rxjs";
import {TheNewsApiService} from "../../features/searchBar/services/the-news-api.service";
import {OpenaiApiService} from "../../features/searchBar/services/openai-api/openai-api.service";
import {GetPromptsService} from "../../features/searchBar/services/get-prompts/get-prompts.service";
import {PerplexityApiService} from "../../features/searchBar/services/perplexity-api/perplexity-api.service";
import {extractJSONBlock, parseJsonSafe} from "../../utils/cleanJsonObject";
import {SupabaseService} from "../supabase/supabase.service";
import {map} from "rxjs/operators";
import {Post} from "../../types/post";
import {AddImagesToChaptersService} from "../../features/searchBar/services/add-image-to-chapters/add-images-to-chapters.service";
import {FormatInStructureService} from "../../features/searchBar/services/format-in-structure/format-in-structure.service";
import {compressImage} from "../../utils/resizeB64JsonIMage";
import {GoogleSearchService} from "../google-search/google-search.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    const openaiApiService = inject(OpenaiApiService);
    const perplexityApiService = inject(PerplexityApiService);
    const getPromptsService = inject(GetPromptsService);
    const supabaseService = inject(SupabaseService);
    const addImagesToChaptersService = inject(AddImagesToChaptersService);
    const formatInStructureService = inject(FormatInStructureService);
    const googleSearchService = inject(GoogleSearchService);
    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService,
      getPromptsService, supabaseService, addImagesToChaptersService, formatInStructureService, googleSearchService);
  }
})
export class SearchInfrastructure {

  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private supabaseService: SupabaseService
    , private addImagesToChaptersService: AddImagesToChaptersService
    , private formatInStructureService: FormatInStructureService
    , private googleSearchService: GoogleSearchService

  ) {}

  isLocalhost(): boolean {
    const hostname = window.location.hostname;
    return hostname === 'localhost';
  }


  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string  }[]> {
    if(this.isLocalhost()) {
      return new Observable<{ url: string; image_url: string }[]>(subscriber => {
        const mock = cptSearchArticle === 0 ? [] : [{ url: 'https://example.com/europe', image_url: 'https://example.com/europe.jpg' }];
        //
        // { url: 'https://example.com/belgique', image_url: 'https://example.com/belgique.jpg' }
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.theNewsApiService.getNewsApi(cptSearchArticle);
    }
  }

  selectArticle(articles: { url: string; image_url: string }[]): Observable<{ valid: boolean | null, explication:{raisonArticle1: string | null}, url: string | null, image_url: string | null }> {
    if(this.isLocalhost()) {
      return of({
        valid: true,
        explication: {raisonArticle1: 'il est bon cet article'},
        url: 'https://example.com/example',
        image_url: 'https://example.com/europe.jpg\''
      });
    } else {
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


  }

  searchIdea(): Observable<{ id: number | null, description: string | null }> {
    if(this.isLocalhost()) {
      return of({ id: 1, description: 'Transformer votre toit en oasis urbaine' })
    } else {
      return from(this.supabaseService.getFirstIdeaPostByMonth(new Date().getMonth()+1, new Date().getFullYear())).pipe(
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

  }

  faq(articleUpgraded: string): Observable<{question: string; response: string}[]> {
    if(this.isLocalhost()) {
      return new Observable<{question: string; response: string}[]>(subscriber => {
        const mock = [
          {question: 'question 1', response: 'response 1'},
          {question: 'question 2', response: 'response 2'},
          {question: 'question 3', response: 'response 3'},
        ]
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      const prompt = this.getPromptsService.getPromptFaq(articleUpgraded);
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          const data: {question: string; response: string}[]  = JSON.parse(extractJSONBlock(result))
          return data;
        })
      );
    }

  }

  generateArticle(url_post?: string): Observable<Post> {
    if(this.isLocalhost()) {
      return new Observable<Post>(subscriber => {
        const mock = {
          "titre": "Transformer votre toit en oasis urbaine",
            "phrase_accroche": "Découvrez comment aménager un jardin sur votre toit en plein cœur de la ville, un projet écologique et esthétique pour reverdir Bruxelles tout en profitant d'un espace vert unique.",
            "article": `<span id="paragraphe-1"><h4>Qu'est-ce qu'un jardin de pluie ?</h4><ul><li>Pourquoi créer un jardin de pluie ?</li></ul><p>Un jardin de pluie est une dépression peu profonde plantée de végétaux adaptés, conçue pour absorber et filtrer les eaux pluviales. Situé généralement en aval d'une surface imperméable (toit, allée), il permet de retenir temporairement l'eau avant qu'elle ne s'infiltre naturellement dans le sol. Cette solution écologique réduit les risques d'inondation, recharge les nappes phréatiques et filtre les polluants. À Bruxelles, où les surfaces imperméabilisées sont nombreuses, ces jardins jouent un rôle crucial dans la gestion durable des eaux pluviales. Ils offrent également un habitat pour la biodiversité locale et embellissent les espaces urbains. Contrairement aux idées reçues, un jardin de pluie n'est pas une mare permanente : l'eau ne stagne que quelques heures après la pluie. C'est donc une solution à la fois pratique et esthétique pour nos régions tempérées.</p></span><span id="paragraphe-2"><h4>Les multiples avantages écologiques</h4><ul><li>Comment contribue-t-il à l'environnement ?</li></ul><p>Le jardin de pluie présente de nombreux bénéfices environnementaux. D'abord, il réduit la charge sur les réseaux d'égouttage, limitant les débordements en cas de fortes précipitations. Ensuite, il filtre naturellement les polluants (hydrocarbures, métaux lourds) avant qu'ils n'atteignent les cours d'eau. Les plantes et le sol agissent comme un filtre biologique, améliorant ainsi la qualité de l'eau. De plus, cette technique permet de recharger les nappes phréatiques, cruciales en période de sécheresse. En ville, ces jardins contribuent à rafraîchir l'air ambiant et à lutter contre les îlots de chaleur. Ils créent aussi des corridors écologiques pour la faune urbaine. Enfin, ils réduisent l'érosion des sols en ralentissant le ruissellement. Une solution polyvalente qui fait du bien à la planète tout en embellissant nos quartiers !</p></span><span id="paragraphe-3"><h4>Comment concevoir son jardin de pluie</h4><ul><li>Par où commencer son projet ?</li></ul><p>La conception d'un jardin de pluie nécessite quelques précautions. D'abord, choisissez un emplacement naturellement humide, à au moins 3 mètres des fondations et 30 mètres des puits. La taille dépend de la surface de toiture ou d'imperméabilisation à drainer : comptez environ 10-20% de cette surface. Creusez une dépression de 15-30 cm de profondeur avec des bords en pente douce. Le sol idéal est un mélange de 50-60% de sable, 20-30% de terre végétale et 20% de compost. Positionnez l'entrée d'eau (gouttière ou drain) au point le plus haut. Pour l'esthétique, variez les formes et intégrez des pierres ou des rondins comme éléments décoratifs. Pensez aussi à prévoir un trop-plein vers le réseau d'eaux pluviales en cas de très fortes pluies. Avec ces bases, vous êtes prêt à passer à l'étape suivante : le choix des plantes !</p></span><span id="paragraphe-4"><h4>Choisir les bonnes plantes</h4><ul><li>Quelles espèces privilégier ?</li></ul><p>Le choix des végétaux est crucial pour un jardin de pluie réussi. Privilégiez des espèces indigènes adaptées aux alternances d'humidité et de sécheresse. Pour la zone la plus humide (fond du jardin), optez pour des plantes hydrophiles comme les iris des marais, les salicaires ou les menthes aquatiques. La zone intermédiaire accueillera des espèces tolérantes comme les eupatoires ou les rudbeckies. En périphérie, choisissez des plantes plus résistantes à la sécheresse une fois établies. À Bruxelles, pensez aux espèces locales comme la reine-des-prés ou la digitale pourpre. Variez les hauteurs, textures et périodes de floraison pour un effet esthétique toute l'année. Évitez les espèces invasives comme la renouée du Japon. Un bon mélange comprend 50% de plantes vivaces, 30% de graminées et 20% d'arbustes. N'oubliez pas que même les plantes adaptées ont besoin d'un an pour bien s'installer avant de montrer leur plein potentiel.</p></span><span id="paragraphe-5"><h4>Entretien et bonnes pratiques</h4><ul><li>Comment maintenir son jardin de pluie ?</li></ul><p>Contrairement aux idées reçues, un jardin de pluie bien conçu demande peu d'entretien. La première année, arrosez régulièrement pour aider à l'installation des plantes. Désherbez manuellement pour éviter la concurrence avec les espèces indésirables. Au printemps, coupez les tiges sèches et divisez les plantes trop envahissantes. Surveillez l'accumulation de sédiments à l'entrée d'eau et nettoyez si nécessaire. Évitez les engrais chimiques qui pourraient polluer les eaux infiltrées. En automne, laissez les feuilles mortes sur place : elles forment un paillis naturel. Tous les 3-5 ans, vérifiez la perméabilité du sol et ajoutez du compost si besoin. En cas de moustiques (rare si l'eau ne stagne pas longtemps), introduisez des prédateurs naturels comme les libellules. Avec ces simples gestes, votre jardin de pluie fonctionnera efficacement pendant des années, devenant même plus beau avec le temps !</p></span><span id="paragraphe-6"><h4>Un projet citoyen à Bruxelles</h4><ul><li>Comment s'impliquer localement ?</li></ul><p>À Bruxelles, plusieurs initiatives encouragent la création de jardins de pluie. La région propose parfois des subsides pour les projets privés ou collectifs. Des ateliers pratiques sont organisés par des associations comme Bruxelles Environnement. Certains quartiers ont transformé des espaces publics en jardins de pluie communautaires, combinant utilité écologique et convivialité. Les écoles aussi s'y mettent, intégrant ces aménagements dans des projets pédagogiques. Pour votre projet, renseignez-vous auprès de votre commune sur les éventuelles réglementations. Participer à ces initiatives permet d'échanger des plantes, des conseils et de créer du lien entre voisins. Et pourquoi ne pas imaginer un réseau de petits jardins de pluie à l'échelle d'une rue ? Chaque goutte compte dans la gestion durable de l'eau en ville. Alors, prêt à transformer la pluie en or vert ?</p></span>`,
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

    } else  {
      const prompt = this.getPromptsService.generateArticle(url_post);
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          return parseJsonSafe(extractJSONBlock(result)) ;
        })
      );
    }


  }

  formatInStructure(article: string, type: string, postTitreAndId?:{titre: string, id: number}[]): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = ' type = ' + type + ' : ' + article;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.formatInStructureService.formatInStructure(article, type, postTitreAndId);
    }
  }

  checkMeteo(): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = `
        Ma météo est bonne 12 degrés.
        `;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      const prompt = this.getPromptsService.meteoArticle();
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          const data: { meteo: string } = JSON.parse(extractJSONBlock(result))
          return data.meteo;
        })
      );
    }

  }

  addVideo(postTitle: string): Observable<any> {
    if(!this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = `
        http://www.youtube.com/watch?v=exempleVideo
        `;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
        const prompt = this.getPromptsService.addVideo(postTitle);
        return from(this.perplexityApiService.fetchData(prompt)).pipe(
            switchMap(result => {
                const videoData: { video: string } = JSON.parse(extractJSONBlock(result));
                const videoUrl = videoData.video && videoData.video.length ? videoData.video : null;
                return videoUrl ? of(videoUrl) : this.googleSearchService.searchFrenchVideo(postTitle).pipe(
                map(videoUrls => {
                  if (!videoUrls.length) return '';
                  const prompt = this.getPromptsService.searchVideoFromYoutubeResult(postTitle, videoUrls);
                  return from(this.openaiApiService.fetchData(prompt, true)).pipe(switchMap(result => {
                    const videoData: { video: string } = JSON.parse(extractJSONBlock(result));
                    const videoUrl = videoData.video && videoData.video.length ? videoData.video : null;
                    return videoUrl ? of(videoUrl) : of('');
                  }));
                })
              );
            })
        );
    }
  }

  setPost(post: Post): Observable<Post> {
    if(this.isLocalhost()) {
      return of( post );
    } else {
      return from(this.supabaseService.updatePostByPostForm(post)).pipe(
        map(data => {
          if (data && data.length > 0) {
            return data[0]; // Retourne le premier élément du tableau
          }
          throw new Error('Aucune donnée retournée après l insertion');
        })
      );
    }
  }

  savePost(post: Post, getMeteo: string, getArticleHtml: string, image_url: string, video: string | null, isArticleValid: boolean | null): Observable<Post> {
    if(this.isLocalhost()) {
      return of(
        {  "id": 644,
          "created_at": "2025-03-25T10:30:00Z",
          "titre": "Le retour du soleil après une semaine pluvieuse",
          "description_meteo": "Un ciel dégagé et des températures en hausse marquent cette belle journée de printemps.",
          "phrase_accroche": "Enfin du soleil ! Découvrez les prévisions détaillées.",
          "article": "Après une semaine de pluie, le soleil fait son grand retour sur l'ensemble du pays. Les températures atteindront les 20°C dans certaines régions. Découvrez comment ce changement de temps impacte votre quotidien et les activités à privilégier.",
          "comments": [],
          "citation": "Le soleil brille pour tout le monde. - Sénèque",
          "lien_url_article": { "lien1": "https://www.senecacom.be/fr/actualites/le-soleil-brille-pour-tout-le-monde"},
          "image_url": "https://exemple.com/images/soleil.jpg",
          "categorie": isArticleValid ? 'actualité' : post.categorie,
          "visite": 1234,
          "valid": true,
          "deleted": false}
      );
    } else {
      const updatedPost: Post = {
        ...post,
        description_meteo: getMeteo,
        article: getArticleHtml,
        image_url: image_url,
        video: video,
        categorie: isArticleValid ? 'actualité' : post.categorie
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
  }

  saveFaq(postId: number | null, faq: {question: string, response: string}[] | null): Observable<boolean> {
    if(this.isLocalhost()) { return of(true); }
    else {
      if (!postId || !faq || faq.length === 0) { return of(false); }
      // Utiliser RxJS pour créer un Observable qui traitera séquentiellement chaque élément FAQ
      return from(faq).pipe(
        // Pour chaque élément FAQ du tableau
        switchMap(faqItem => {
          const value = {
            question: faqItem.question,
            response: faqItem.response,
            fk_post_id: postId
          };
          return this.supabaseService.setNewFaq(value);
        }),
        // Après avoir traité tous les éléments, retourner true pour indiquer le succès
        map(() => true),
      );
    }

  }

  updateIdeaPost(ideaPostId: number, postId: number): Observable<any> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        console.log(`Recherche d'idée dans le mois courrent`);
        const mock = `Transformer votre toit en oasis urbaine`;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return from(this.supabaseService.updateIdeaPostById(ideaPostId, postId));
    }
  }

  addImagesInArticle(getPost: string, getPostId: number): Observable<{success: boolean}> {
    if(this.isLocalhost()) {
      return of({success: true});
    } else {
      return from(this.addImagesToChaptersService.getKeyWordsFromChapitreInArticleAndSetImageUrl(getPost, getPostId));
    }
  }

  async generateImageIa(description: string, postId: number) {
    if(this.isLocalhost()) {
      return of({success: true});
    } else {
      let image_url = await this.openaiApiService.imageGenerartor(this.getPromptsService.getOpenAiPromptImageGenerator(description));
      image_url = await compressImage(image_url, 500, 300)
      await this.supabaseService.updateImageUrlPostByIdForm(postId, image_url);
      return of({success: true});
    }
  }

  getPostTitreAndId(): Observable<{ titre: string; id: number }[]>  {
    if(this.isLocalhost()) {
      return of([{titre: 'dummy', id: 1}]);
    } else {
      return from(this.supabaseService.getPostTitreAndId())
    }

  }

  getOneOrManyPostForm(postId?: number): Observable<Post[]> {
    return from(this.supabaseService.getOneOrManyPostForm(postId));
  }

  getPostWithComments(id?: number | null, orderBySelected?: string | null): Observable<Post[]> {
      return from(this.supabaseService.getPostWithComments(id, orderBySelected));
  }

  deletePost(id: number) {
    return from(this.supabaseService.deletePostByIdForm(id));
  }

  validPost(id: number) {
    return from(this.supabaseService.updateValidPostByIdForm(id));
  }

  deleteComment(id: number) {
    return from(this.supabaseService.deleteCommentById(id));
  }

  validComment(id: number) {
    return from(this.supabaseService.valideCommentById(id));
  }



}
