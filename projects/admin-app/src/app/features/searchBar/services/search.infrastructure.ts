import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {TheNewsApiService} from "./the-news-api.service";
import {OpenaiApiService} from "./openai-api.service";
import {GetPromptsService} from "./get-prompts.service";
import {PerplexityApiService} from "./perplexity-api.service";
import {extractJSONBlock} from "../../../utils/cleanJsonObject";
import {UnsplashImageService} from "./unsplash-image.service";
import {SupabaseService} from "./supabase/supabase.service";

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const theNewsApiService = inject(TheNewsApiService);
    const openaiApiService = inject(OpenaiApiService);
    const perplexityApiService = inject(PerplexityApiService);
    const getPromptsService = inject(GetPromptsService);
    const unsplashImageService = inject(UnsplashImageService);
    const supabaseService = inject(SupabaseService);

    return new SearchInfrastructure(theNewsApiService, openaiApiService, perplexityApiService, getPromptsService, unsplashImageService, supabaseService);
  }
})
export class SearchInfrastructure {
  constructor(private theNewsApiService: TheNewsApiService
    , private openaiApiService: OpenaiApiService
    , private perplexityApiService: PerplexityApiService
    , private getPromptsService: GetPromptsService
    , private unsplashImageService: UnsplashImageService
    , private supabaseService: SupabaseService
  ) {}

  searchArticle(cptSearchArticle: number): Observable<{ url: string; image_url: string  }[]> {
     // return this.theNewsApiService.getNewsApi(cptSearchArticle);
    return new Observable<{ url: string; image_url: string }[]>(subscriber => {
      const mockArticles = cptSearchArticle === 0 ? [] : [];
      //{ url: 'https://example.com/article1', image_url: 'https://example.com/image1.jpg' }
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  searchIdea(): Observable<string> {
    return new Observable<string>(subscriber => {
      console.log(`Recherche d'idée dans le mois courrent`);
      const mockArticles = `dummy idee recue`;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

  generateArticle(url_post?: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mockArticles = url_post ?
        `
        ${url_post} => Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
À Jupille, dans la région de Liège, la brasserie AB InBev a mis en place une initiative innovante pour purifier les eaux usées et les rendre potables.
Le Processus de Purification des Eaux Usées ⚗️
Depuis 2019, la brasserie de Jupille, en collaboration avec De Watergroep, purifie environ 400 000 m³ d'eau usée chaque année, soit l'équivalent de 160 piscines olympiques.
Réduction de l'Empreinte Hydrique des Brasseries 📉
La réduction de l'empreinte hydrique est un élément clé des objectifs de développement durable d'AB InBev. L'entreprise utilise l'approche des 5R (Reduce, Reuse, Recycle, Restore, Recover)
Surveillance et Protection des Ressources en Eau 🛡️
La brasserie de Jupille se concentre également sur la surveillance et la protection des ressources en eau. Une zone de protection des puits est mise en place pour éviter toute pollution des eaux de puits.
Impact Environnemental et Économique 🌍
Les initiatives de AB InBev pour réduire l'empreinte hydrique ont des implications environnementales et économiques significatives. L'utilisation rationnelle de l'eau est cruciale, et l'entreprise vise à protéger cette ressource naturelle.
Initiatives Globales et Partenariats pour la Durabilité 🌟
AB InBev engage des initiatives globales pour adresser les défis liés à l'eau. Entre 2017 et 2022, l'entreprise a réduit sa consommation d'eau de 14% et a atteint un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre.` :
        `
Introduction à la Gestion Durable de l'Eau chez AB InBev 🌊
À Jupille, dans la région de Liège, la brasserie AB InBev a mis en place une initiative innovante pour purifier les eaux usées et les rendre potables.
Le Processus de Purification des Eaux Usées ⚗️
Depuis 2019, la brasserie de Jupille, en collaboration avec De Watergroep, purifie environ 400 000 m³ d'eau usée chaque année, soit l'équivalent de 160 piscines olympiques.
Réduction de l'Empreinte Hydrique des Brasseries 📉
La réduction de l'empreinte hydrique est un élément clé des objectifs de développement durable d'AB InBev. L'entreprise utilise l'approche des 5R (Reduce, Reuse, Recycle, Restore, Recover)
Surveillance et Protection des Ressources en Eau 🛡️
La brasserie de Jupille se concentre également sur la surveillance et la protection des ressources en eau. Une zone de protection des puits est mise en place pour éviter toute pollution des eaux de puits.
Impact Environnemental et Économique 🌍
Les initiatives de AB InBev pour réduire l'empreinte hydrique ont des implications environnementales et économiques significatives. L'utilisation rationnelle de l'eau est cruciale, et l'entreprise vise à protéger cette ressource naturelle.
Initiatives Globales et Partenariats pour la Durabilité 🌟
AB InBev engage des initiatives globales pour adresser les défis liés à l'eau. Entre 2017 et 2022, l'entreprise a réduit sa consommation d'eau de 14% et a atteint un ratio d'efficacité hydrique de 2,64 hectolitres/hectolitre.
        `;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }


  upgradeArticle(article: string): Observable<string> {
    return new Observable<string>(subscriber => {
      const mockArticles =
        `Super Article => ${article}`;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }


  formatInHtmlArticle(): Observable<string> {
    return new Observable<string>(subscriber => {
      const mockArticles = `
      <span> <h4>🌟 Chapitre 1: Les Défis et les Opportunités du Jardinage Hivernal</h4> <p>Jardiner en hiver présente des défis uniques, mais aussi de nombreuses opportunités pour les jardiniers déterminés. Les températures glaciales, le gel et le manque de lumière solaire demandent une approche différente comparée aux mois plus chauds. Cependant, avec le bon choix de cultures et les techniques appropriées, vous pouvez continuer à récolter des légumes frais et savoureux tout au long de l’hiver.</p> <p>Il est crucial de <b>privilégier des légumes résistants au froid</b>, capables de survivre et même de s’épanouir dans des conditions moins clémentes. Les légumes d’hiver ont généralement un cycle de vie plus long, nécessitant ainsi de la patience et une surveillance attentive pour s’assurer qu’ils reçoivent les nutriments nécessaires tout au long de leur développement.</p> </span>
      <span> <h4>🥬 Chapitre 2: Les Meilleurs Légumes à Cultiver en Hiver</h4> <p>L’hiver n’est pas la fin de votre récolte ; plusieurs légumes robustes prospèrent dans le froid, certains développant même des saveurs plus riches après une légère gelée. Voici une sélection des meilleurs légumes à cultiver pour une récolte hivernale réussie.</p> <ul> <li><b>Les Choux :</b> Le chou frisé et le chou de Bruxelles sont des exemples de choux résistants au froid, riches en nutriments et capables de résister à des températures très basses.</li> <li><b>Les Poireaux :</b> Ces légumes rustiques supportent le froid extrême, nécessitent peu d’entretien et peuvent rester en terre jusqu’à leur utilisation.</li> <li><b>Les Carottes :</b> Les variétés de carottes d’hiver sont plus robustes et peuvent être récoltées jusqu’au début de l’hiver ou même toute la saison si elles sont correctement protégées. Le froid transforme l’amidon en sucre, rendant les carottes encore plus savoureuses.</li> <li><b>Les Betteraves :</b> Résistantes et comestibles, les betteraves peuvent être récoltées tard dans la saison, et leurs jeunes feuilles sont excellentes dans les salades.</li> <li><b>Les Épinards :</b> Ce légume à feuilles peut survivre à des températures très basses, surtout si cultivé sous couverture ou dans une serre non chauffée.</li> </ul> </span>
      <span> <h4>🌱 Chapitre 3: Cultiver des Microgreens et des Champignons en Hiver</h4> <p>En plus des légumes traditionnels, vous pouvez également cultiver des microgreens et des champignons comestibles pendant l’hiver. Ces options sont idéales pour les jardiniers qui disposent d’un espace intérieur ou d’une serre.</p> <ul> <li><b>Microgreens :</b> Ces jeunes pousses comestibles de plantes comme la roquette, la moutarde, le basilic, et le radis poussent rapidement et peuvent être cultivées à l’intérieur. Elles offrent une explosion de saveurs et de nutriments dans vos plats hivernaux.</li> <li><b>Champignons :</b> Vous pouvez cultiver des champignons comestibles comme les pleurotes, les shiitakes et les champignons de Paris à l’intérieur ou dans des endroits sombres et frais. Ces champignons ajoutent une dimension unique à vos repas hivernaux.</li> </ul> </span> <br id='link_to_service'>
      <span> <h4>🌿 Chapitre 4: Techniques de Semis et de Repiquage pour l’Hiver</h4> <p>Pour réussir votre potager d’hiver, il est important de maîtriser les techniques de semis et de repiquage adaptées à la saison.</p> <ul> <li><b>Semis en Intérieur :</b> En décembre et en janvier, vous pouvez semer des herbes aromatiques comme le basilic, la ciboulette, la coriandre, le persil, le thym, et la menthe. Les poivrons, les piments, les tomates, les laitues, les épinards, les brocolis, les choux-fleurs et les choux de Bruxelles peuvent également être semés en intérieur pour une récolte ultérieure.</li> <li><b>Contre-Plantation :</b> Cette technique permet d’implanter les plantules de vos futurs légumes alors que la culture précédente n’est pas encore terminée. Par exemple, taillez vos tomates à 50 cm du sol après la récolte des premiers bouquets pour planter des salades, des mâches ou des épinards.</li> </ul> </span>
      <span> <h4>🌱 Chapitre 5: Préparation du Sol et Entretien Hivernal</h4> <p>Avant de semer, assurez-vous que le sol est prêt et qu’il a suffisamment séché après les dernières pluies ou chutes de neige. L’entretien du sol est crucial pour le succès de votre potager d’hiver.</p> <ul> <li><b>Enrichissement du Sol :</b> Vous pouvez mettre du compost au lieu de paillage pour enrichir le sol. Cela aide à maintenir la fertilité et la structure du sol tout au long de l’hiver.</li> <li><b>Protection contre le Gel :</b> Protégez vos plantes des gels prolongés en utilisant des voiles ou en les paillant fortement. Les betteraves, par exemple, doivent être récoltées ou protégées si les prévisions annoncent un gel prolongé inférieur à -4°C.</li> </ul> </span>
      <span> <h4>📍 Chapitre 6: Choix de Variétés Adaptées aux Conditions Locales</h4> <p>Pour assurer le succès de votre potager d’hiver, il est essentiel de choisir des variétés de légumes adaptées à votre climat local. Certains légumes ont été développés pour résister à des conditions spécifiques, comme des températures extrêmement basses ou des périodes de gel.</p> <ul> <li><b>Consultation des Ressources Locales :</b> Consultez les coopératives agricoles ou les universités pour des recommandations adaptées à votre région. Des variétés comme le chou de Bruxelles, les betteraves 'chioggia' ou 'cylindra', et les laitues 'appia' ou 'attraktion' sont souvent recommandées pour les régions comme la Belgique.</li> </ul> <p>En suivant ces conseils et en adaptant vos techniques de jardinage aux conditions hivernales, vous pourrez profiter d’un potager productif et diversifié même pendant les mois les plus froids. Bon jardinage !</p> </span>
      `;
      setTimeout(() => {
        subscriber.next(mockArticles);
        subscriber.complete();
      }, 1000);
    });
  }

}
