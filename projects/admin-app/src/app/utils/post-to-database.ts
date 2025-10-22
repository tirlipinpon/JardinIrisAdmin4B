import { Post } from '../types/post';
import { PostDatabase } from '../types/post-database';

/**
 * Convertit un objet Post en PostDatabase en excluant les relations
 * @param post - L'objet Post complet
 * @returns L'objet PostDatabase prêt pour la sauvegarde en base
 */
export function postToDatabase(post: Post): PostDatabase {
  return {
    id: post.id,
    created_at: post.created_at,
    titre: post.titre,
    description_meteo: post.description_meteo,
    phrase_accroche: post.phrase_accroche,
    article: post.article,
    citation: post.citation,
    lien_url_article: post.lien_url_article,
    image_url: post.image_url,
    categorie: post.categorie,
    visite: post.visite,
    valid: post.valid,
    deleted: post.deleted,
    video: post.video,
    new_href: post.new_href
  };
}
