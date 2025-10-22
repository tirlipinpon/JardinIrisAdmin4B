/**
 * Interface pour les données de post à sauvegarder en base de données
 * Exclut les relations qui sont gérées séparément
 */
export interface PostDatabase {
  id?: number;
  created_at?: string;
  titre?: string;
  description_meteo?: string;
  phrase_accroche?: string;
  article?: string;
  citation?: string;
  lien_url_article?: { lien1: string };
  image_url?: string;
  categorie?: string;
  visite?: number;
  valid?: boolean;
  deleted?: boolean;
  video?: string | null;
  new_href?: string | null;
}
