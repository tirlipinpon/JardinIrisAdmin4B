export interface ImageChapitre {
  id: number;
  fk_post: number;
  url_Image: string;
  created_at?: string; // ISO date string
  chapitre_id: number;
  explanation_word?: string;
  chapitre_key_word: string;
  explanation_image?: string; // valeur non fournie, optionnelle
}
