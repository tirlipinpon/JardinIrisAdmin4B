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
            "phrase_accroche": "Découvrez comment aménager un jardin de fleurs sur votre toit  de tulipe en plein cœur de la ville arbre mort ou chêne, un projet écologique et esthétique pour reverdir Bruxelles tout en profitant d'un espace vert unique.",
            "article": `
<span id="paragraphe-1"><h4>Le jardin de la biodiversité</h4><ul><li>Les pivoines sont des fleurs magnifiques qui attirent les abeilles.</li></ul><p>Le chêne majestueux est un arbre vieux de plusieurs siècles. Les hérissons se réfugient souvent sous ses racines. Le basilic pousse bien en été et parfume les plats méditerranéens.</p></span>
<span id="paragraphe-2"><h4>La vie sauvage autour du jardin</h4><ul><li>Les libellules volent autour des étangs, capturant les moustiques.</li></ul><p>Les cerisiers offrent des fruits délicieux au printemps. Le saule pleureur est souvent planté près des rivières pour ses racines profondes. Les lapins apprécient les jardins où ils peuvent se cacher dans les herbes hautes.</p></span>
<span id="paragraphe-3"><h4>Les plantes vivaces</h4><ul><li>Les lavandes sont idéales pour repousser les moustiques.</li></ul><p>Le figuier produit des fruits sucrés en fin d'été. Le rosier grimpant ajoute une touche romantique aux murs du jardin. Les oiseaux chantent souvent dans les arbres fruitiers comme les pommiers et les pruniers.</p></span>
<span id="paragraphe-4"><h4>Fleurs et insectes au jardin</h4><ul><li>Les tournesols suivent la trajectoire du soleil toute la journée.</li></ul><p>Les frelons peuvent être agressifs mais jouent un rôle dans la pollinisation. Les orchidées exotiques apportent une touche colorée aux espaces ombragés. Le thym, lorsqu'il fleurit, attire de nombreux pollinisateurs.</p></span>
<span id="paragraphe-5"><h4>Un jardin nourrissant</h4><ul><li>Les fraisiers produisent des fruits délicieux tout l'été.</li></ul><p>Les herbes de Provence, comme le romarin, parfument les plats d'été. Les pommiers offrent une abondance de fruits en automne. Les oiseaux de jardin, comme les mésanges, se nourrissent des graines et des baies des buissons.</p></span>
<span id="paragraphe-6"><h4>Un écosystème naturel</h4><ul><li>Les lys apportent des couleurs vives au jardin en été.</li></ul><p>Les écureuils collectent les noix sous les chênes. Les bambous créent une haie dense et résistante au vent. Les papillons trouvent refuge parmi les fleurs de lavande et de thym.</p></span>
`,
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
    if(this.isLocalhost() && type !== 'VEGETAL') {
      return new Observable<string>(subscriber => {
        const mock = ' type=' + type + ' : ' + article;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.formatInStructureService.formatInStructure(article, type, postTitreAndId);
    }
  }

  addScientificName(article: string): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = article;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {

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

  getPostWithCommentsAndImages(id?: number | null, orderBySelected?: string | null): Observable<Post[]> {
      return from(this.supabaseService.getPostWithCommentsAndImages(id, orderBySelected));
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

  editPostVideo(id: number, idYoutube: string) {
    return from(this.supabaseService.editPostVideo(id, idYoutube));
  }


}
