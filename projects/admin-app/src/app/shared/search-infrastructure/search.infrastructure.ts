import { inject, Injectable } from "@angular/core";
import {
  from,
  Observable, of, switchMap, toArray
} from "rxjs";
import { TheNewsApiService } from "../../features/searchBar/services/the-news-api.service";
import { OpenaiApiService } from "../../features/searchBar/services/openai-api/openai-api.service";
import { GetPromptsService } from "../../features/searchBar/services/get-prompts/get-prompts.service";
import { PerplexityApiService } from "../../features/searchBar/services/perplexity-api/perplexity-api.service";
import { extractJSONBlock, parseJsonSafe } from "../../utils/cleanJsonObject";
import { SupabaseService } from "../supabase/supabase.service";
import { map } from "rxjs/operators";
import { Post } from "../../types/post";
import { AddImagesToChaptersService } from "../../features/searchBar/services/add-image-to-chapters/add-images-to-chapters.service";
import { FormatInStructureService } from "../../features/searchBar/services/format-in-structure/format-in-structure.service";
import { GoogleSearchService } from "../../features/all/services/google-search/google-search.service";
import {
  AddScientificNameService
} from "../../features/searchBar/services/add-scientific-name/add-scientific-name.service";
import { GeminiApiService } from "../../features/searchBar/services/gemini-api/gemini-api.service";

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
    const addScientificNameService = inject(AddScientificNameService);
    const geminiApiService = inject(GeminiApiService);


    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService,
      getPromptsService, supabaseService, addImagesToChaptersService, formatInStructureService, googleSearchService,
      addScientificNameService, geminiApiService);
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
    , private addScientificNameService: AddScientificNameService
    , private geminiApiService: GeminiApiService
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
          "categorie": "jardin",
          "new_href": "jardin-potager-blog"
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

  formatInStructure(article: string, type: string, postTitreIdNewHref?:{titre: string, id: number, new_href: string}[]): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = ' type=' + type + ' : ' + article;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.formatInStructureService.formatInStructure(article, type, postTitreIdNewHref);
    }
  }

  addUrlFromScientificNameInHtml(article: string): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = article //"<span id=\"paragraphe-1\"><h4>Le jardin de la biodiversité</h4><ul><li>Les pivoines sont des fleurs magnifiques qui attirent les abeilles.</li></ul><p>Le <span class=\"inat-vegetal\" data-taxon-name=\"Quercus\" data-photo-url=\"\" data-paragraphe-id=\"1-1\">chêne<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> majestueux est un arbre vieux de plusieurs siècles. Les hérissons se réfugient souvent sous ses racines. Le <span class=\"inat-vegetal\" data-taxon-name=\"Ocimum basilicum\" data-photo-url=\"\" data-paragraphe-id=\"1-2\">basilic<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> pousse bien en été et parfume les plats méditerranéens.</p></span> <span id=\"paragraphe-2\"><h4>La vie sauvage autour du jardin</h4><ul><li>Les libellules volent autour des étangs, capturant les moustiques.</li></ul><p>Les <span class=\"inat-vegetal\" data-taxon-name=\"Prunus\" data-photo-url=\"\" data-paragraphe-id=\"2-1\">cerisiers<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> offrent des fruits délicieux au printemps. Le <span class=\"inat-vegetal\" data-taxon-name=\"Salix babylonica\" data-photo-url=\"\" data-paragraphe-id=\"2-2\">saule pleureur<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> est souvent planté près des rivières pour ses racines profondes. Les lapins apprécient les jardins où ils peuvent se cacher dans les herbes hautes.</p></span> <span id=\"paragraphe-3\"><h4>Les plantes vivaces</h4><ul><li>Les lavandes sont idéales pour repousser les moustiques.</li></ul><p>Le <span class=\"inat-vegetal\" data-taxon-name=\"Ficus carica\" data-photo-url=\"\" data-paragraphe-id=\"3-1\">figuier<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> produit des fruits sucrés en fin d'été. Le <span class=\"inat-vegetal\" data-taxon-name=\"Rosa\" data-photo-url=\"\" data-paragraphe-id=\"3-2\">rosier grimpant<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> ajoute une touche romantique aux murs du jardin. Les oiseaux chantent souvent dans les arbres fruitiers comme les <span class=\"inat-vegetal\" data-taxon-name=\"Malus domestica\" data-photo-url=\"\" data-paragraphe-id=\"3-3\">pommiers<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> et les <span class=\"inat-vegetal\" data-taxon-name=\"Prunus domestica\" data-photo-url=\"\" data-paragraphe-id=\"3-4\">pruniers<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>.</p></span> <span id=\"paragraphe-4\"><h4>Fleurs et insectes au jardin</h4><ul><li>Les tournesols suivent la trajectoire du soleil toute la journée.</li></ul><p>Les frelons peuvent être agressifs mais jouent un rôle dans la pollinisation. Les <span class=\"inat-vegetal\" data-taxon-name=\"Orchidaceae\" data-photo-url=\"\" data-paragraphe-id=\"4-1\">orchidées<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> exotiques apportent une touche colorée aux espaces ombragés. Le <span class=\"inat-vegetal\" data-taxon-name=\"Thymus\" data-photo-url=\"\" data-paragraphe-id=\"4-2\">thym<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>, lorsqu'il fleurit, attire de nombreux pollinisateurs.</p></span> <span id=\"paragraphe-5\"><h4>Un jardin nourrissant</h4><ul><li>Les fraisiers produisent des fruits délicieux tout l'été.</li></ul><p>Les <span class=\"inat-vegetal\" data-taxon-name=\"Herbes de Provence\" data-photo-url=\"\" data-paragraphe-id=\"5-1\">herbes de Provence<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>, comme le <span class=\"inat-vegetal\" data-taxon-name=\"Rosmarinus officinalis\" data-photo-url=\"\" data-paragraphe-id=\"5-2\">romarin<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>, parfument les plats d'été. Les <span class=\"inat-vegetal\" data-taxon-name=\"Malus domestica\" data-photo-url=\"\" data-paragraphe-id=\"5-3\">pommiers<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> offrent une abondance de fruits en automne. Les oiseaux de jardin, comme les mésanges, se nourrissent des graines et des baies des buissons.</p></span> <span id=\"paragraphe-6\"><h4>Un écosystème naturel</h4><ul><li>Les lys apportent des couleurs vives au jardin en été.</li></ul><p>Les écureuils collectent les noix sous les <span class=\"inat-vegetal\" data-taxon-name=\"Quercus\" data-photo-url=\"\" data-paragraphe-id=\"6-1\">chênes<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>. Les <span class=\"inat-vegetal\" data-taxon-name=\"Bambusoideae\" data-photo-url=\"\" data-paragraphe-id=\"6-2\">bambous<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> créent une haie dense et résistante au vent. Les papillons trouvent refuge parmi les fleurs de <span class=\"inat-vegetal\" data-taxon-name=\"Lavandula\" data-photo-url=\"\" data-paragraphe-id=\"6-3\">lavande<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span> et de <span class=\"inat-vegetal\" data-taxon-name=\"Thymus\" data-photo-url=\"\" data-paragraphe-id=\"6-4\">thym<div class=\"inat-vegetal-tooltip\"><img src=\"\" alt=\"\"/></div></span>.</p></span>";
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return  this.addScientificNameService.processAddUrlFromScientificNameInHtml(article);
    }
  }
  // async
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
  // async
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
  // async
  addVideo(postTitle: string): Observable<any> {
    if(this.isLocalhost()) {
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
  // async
  generateSeoNewHref(postTitre: string): Observable<string> {
    if(this.isLocalhost()) {
      return new Observable<string>(subscriber => {
        const mock = `
        blog-detail-jardinier-paysagiste-limace
        `;
        setTimeout(() => {
          subscriber.next(mock);
          subscriber.complete();
        }, 1000);
      });
    } else {
      const prompt = this.getPromptsService.getPromptSelectKeyWordsSeoUrl(postTitre);
      return from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Problème dans generateSeoNewHref avec l\'API OpenAI');
          }
          const data: { url: string } = JSON.parse(extractJSONBlock(result))
          return data.url;
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

  savePost(post: Post, getMeteo: string, getArticleHtml: string, image_url: string, video: string | null, isArticleValid: boolean | null, new_href: string): Observable<Post> {
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
          "deleted": false,
          "new_href": "dummy-new-href",
        }
      );
    } else {
      const updatedPost: Post = {
        ...post,
        description_meteo: getMeteo,
        article: getArticleHtml,
        image_url: image_url,
        video: video,
        categorie: isArticleValid ? 'actualité' : post.categorie,
        new_href: new_href
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
  // async
  addImagesInArticle(getPost: string, getPostId: number): Observable<{success: boolean}> {
    if(this.isLocalhost()) {
      return of({success: true});
    } else {
      return from(this.addImagesToChaptersService.getKeyWordsFromChapitreInArticleAndSetImageUrl(getPost, getPostId));
    }
  }
  // async
  async generateImageIa(description: string, postId: number) {
    if (this.isLocalhost()) {
      return of({ success: true });
    } else {
      // 1️⃣ Générer l'image en base64
      const b64_json = await this.openaiApiService.imageGeneratorUrl(this.getPromptsService.getOpenAiPromptImageGenerator(description));
      // 2️⃣ Convertir le base64 en Blob
      if (b64_json) {
        // 3️⃣ Uploader le Blob dans Supabase Storage
        const imageUrl = await this.supabaseService.uploadBase64ToSupabase(postId, b64_json);
        // 4️⃣ Mettre à jour le post avec l'URL publique
        await this.supabaseService.updateImageUrlPostByIdForm(postId, imageUrl!);
      }
      return of({ success: true });
    }
  }

  getPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string}[]>  {
    if(this.isLocalhost()) {
      return of([{titre: 'dummy', id: 1, new_href: 'dummy-jardinier-paysagiste'}]);
    } else {
      return from(this.supabaseService.getPostTitreAndId())
    }

  }

  getOneOrManyPostForm(postId?: number): Observable<Post[]> {
    return from(this.supabaseService.getOneOrManyPostForm(postId));
  }


  /*  CRUD    */
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

  editImagesChapitreArticle(id: number, url: string, key: string) {
    return from(this.supabaseService.editImagesChapitreArticle(id, url, key));
  }

  /**
   * Traite et upload les images de chapitres qui ont été modifiées
   * @param postId - ID du post
   * @param imagesChapitres - Array des images de chapitres
   * @returns Observable avec le résultat du traitement
   */
  processChangedImagesChapitres(postId: number, imagesChapitres: any[]): Observable<boolean> {
    if(this.isLocalhost()) {
      return of(true);
    }

    // Filtrer les images qui ont été changées
    const changedImages = imagesChapitres.filter(img => img.changed === true);

    if (changedImages.length === 0) {
      console.log(`[processChangedImagesChapitres] Aucune image changée pour le post ${postId}`);
      return of(true);
    }

    console.log(`[processChangedImagesChapitres] ${changedImages.length} image(s) à uploader pour le post ${postId}`);
    console.log(`[processChangedImagesChapitres] Images à traiter:`, changedImages.map(img => ({
      id: img.id,
      chapitre_id: img.chapitre_id,
      url: img.url_Image,
      key_word: img.chapitre_key_word
    })));

    // Traiter chaque image changée séquentiellement avec retry
    return from(changedImages).pipe(
      switchMap(async (image) => {
        const maxRetries = 3;
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`[processChangedImagesChapitres] Tentative ${attempt}/${maxRetries} pour l'image chapitre ${image.chapitre_id} (ID: ${image.id})`);
            console.log(`[processChangedImagesChapitres] URL source: ${image.url_Image}`);
            
            // 1️⃣ Upload de l'image vers Supabase Storage
            const newUrl = await this.supabaseService.uploadImageChapitreFromUrl(
              postId,
              image.chapitre_id,
              image.url_Image
            );

            if (!newUrl) {
              throw new Error(`Échec de l'upload de l'image pour le chapitre ${image.chapitre_id} - URL retournée null`);
            }

            console.log(`[processChangedImagesChapitres] ✓ Upload réussi pour chapitre ${image.chapitre_id}, nouvelle URL: ${newUrl}`);

            // 2️⃣ Mise à jour de l'URL dans la base de données
            const updateResult = await this.supabaseService.updateImageChapitreUrl(image.id, newUrl);
            
            if (!updateResult) {
              throw new Error(`Échec de la mise à jour en base de données pour l'image ID ${image.id}`);
            }
            
            console.log(`[processChangedImagesChapitres] ✓ Image chapitre ${image.chapitre_id} traitée avec succès (tentative ${attempt})`);
            return { success: true, imageId: image.id, chapitreId: image.chapitre_id, newUrl };
            
          } catch (error) {
            lastError = error as Error;
            console.error(`[processChangedImagesChapitres] ❌ Erreur tentative ${attempt}/${maxRetries} pour l'image chapitre ${image.chapitre_id}:`, {
              error: error,
              imageId: image.id,
              chapitreId: image.chapitre_id,
              url: image.url_Image,
              attempt: attempt
            });
            
            // Si ce n'est pas la dernière tentative, attendre avant de réessayer
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt - 1) * 1000; // Délai exponentiel: 1s, 2s, 4s
              console.log(`[processChangedImagesChapitres] Attente de ${delay}ms avant la tentative ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        // Si toutes les tentatives ont échoué
        console.error(`[processChangedImagesChapitres] ❌ ÉCHEC DÉFINITIF pour l'image chapitre ${image.chapitre_id} après ${maxRetries} tentatives:`, {
          imageId: image.id,
          chapitreId: image.chapitre_id,
          url: image.url_Image,
          lastError: lastError
        });
        
        // Retourner un objet d'erreur au lieu de throw pour continuer le traitement des autres images
        return { 
          success: false, 
          imageId: image.id, 
          chapitreId: image.chapitre_id, 
          error: lastError,
          url: image.url_Image
        };
      }),
      // Collecter tous les résultats et les traiter
      toArray(),
      map((results) => {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`[processChangedImagesChapitres] Résumé du traitement pour le post ${postId}:`);
        console.log(`[processChangedImagesChapitres] - Images traitées avec succès: ${successful.length}`);
        console.log(`[processChangedImagesChapitres] - Images en échec: ${failed.length}`);
        
        if (successful.length > 0) {
          console.log(`[processChangedImagesChapitres] Images traitées avec succès:`, successful.map(s => ({
            imageId: s.imageId,
            chapitreId: s.chapitreId,
            newUrl: s.newUrl
          })));
        }
        
        if (failed.length > 0) {
          console.error(`[processChangedImagesChapitres] Images en échec:`, failed.map(f => ({
            imageId: f.imageId,
            chapitreId: f.chapitreId,
            url: f.url,
            error: f.error?.message
          })));
        }
        
        // Retourner true si au moins une image a été traitée avec succès
        // ou si aucune image n'a été traitée (cas où toutes les images étaient déjà uploadées)
        return successful.length > 0 || failed.length === 0;
      })
    );
  }

}
