import {Comment} from "./comment";

export interface Post {
  id?: number;
  created_at?: string;
  titre?: string;
  description_meteo?: string;
  phrase_accroche?: string;
  article?: string;
  comments?: Comment[];
  citation?: string;
  lien_url_article?: { lien1: string };
  image_url?: string;
  categorie?: string;
  visite?: number;
  valid?: boolean;
  deleted?: boolean;
  video?: string;
}

/*
{
  "id": 1,
  "created_at": "2025-03-25T10:30:00Z",
  "titre": "Le retour du soleil après une semaine pluvieuse",
  "description_meteo": "Un ciel dégagé et des températures en hausse marquent cette belle journée de printemps.",
  "phrase_accroche": "Enfin du soleil ! Découvrez les prévisions détaillées.",
  "article": "Après une semaine de pluie, le soleil fait son grand retour sur l'ensemble du pays. Les températures atteindront les 20°C dans certaines régions. Découvrez comment ce changement de temps impacte votre quotidien et les activités à privilégier.",
  "comments": [],
  "citation": "Le soleil brille pour tout le monde. - Sénèque",
  "lien_url_article": "https://exemple.com/article-meteo",
  "image_url": "https://exemple.com/images/soleil.jpg",
  "categorie": "Météo",
  "visite": 1234,
  "valid": true,
  "deleted": false
}
*/
