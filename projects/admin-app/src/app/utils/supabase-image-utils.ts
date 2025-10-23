/**
 * Utilitaires pour la gestion des images Supabase
 */

/**
 * Extrait le slug d'une URL Supabase
 * @param url - URL complète Supabase
 * @returns Slug du fichier (nom sans extension) ou URL originale si non-Supabase
 */
export function extractSlugFromSupabaseUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    console.warn('[SupabaseImageUtils] URL invalide pour extraction du slug:', { url });
    return url;
  }

  // Vérifier si c'est une URL Supabase
  const supabasePattern = /zmgfaiprgbawcernymqa\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\/\d+\/(.+)$/;
  const match = url.match(supabasePattern);
  
  if (match && match[1]) {
    const fullFilename = match[1];
    // Extraire le nom sans extension
    const slug = removeFileExtension(fullFilename);
    
    console.log('[SupabaseImageUtils] Slug extrait:', {
      originalUrl: url,
      fullFilename,
      slug
    });
    
    return slug;
  }
  
  // Si ce n'est pas une URL Supabase, retourner l'URL originale
  console.log('[SupabaseImageUtils] URL non-Supabase, retour de l\'URL originale:', { url });
  return url;
}

/**
 * Génère l'alt text à partir d'une URL Supabase
 * @param url - URL complète Supabase
 * @param keyWord - Mot-clé optionnel
 * @returns Alt text SEO-friendly
 */
export function generateAltTextFromUrl(url: string, keyWord?: string): string {
  if (keyWord && keyWord.trim()) {
    // Utiliser le key_word comme base pour l'alt text
    const altText = textToSlug(keyWord);
    console.log('[SupabaseImageUtils] Alt text généré à partir du key_word:', {
      keyWord,
      altText,
      url
    });
    return altText;
  }
  
  // Extraire le slug de l'URL Supabase
  const slug = extractSlugFromSupabaseUrl(url);
  
  // Si c'est une URL Supabase, utiliser le slug
  if (slug !== url) {
    console.log('[SupabaseImageUtils] Alt text généré à partir du slug Supabase:', {
      url,
      slug,
      altText: slug
    });
    return slug;
  }
  
  // Fallback: utiliser le nom de fichier sans extension
  const altText = removeFileExtension(url);
  console.log('[SupabaseImageUtils] Alt text généré à partir de l\'URL (fallback):', {
    url,
    altText
  });
  
  return altText;
}

/**
 * Génère le src pour l'image avec l'URL complète du site
 * @param url - URL complète Supabase
 * @param postId - ID du post (optionnel, extrait de l'URL si non fourni)
 * @returns URL complète du site avec le slug
 */
export function generateImageSrc(url: string, postId?: number): string {
  const urlInfo = parseSupabaseUrl(url);
  
  // Utiliser le postId fourni ou extraire de l'URL
  const finalPostId = postId || (urlInfo.isValid ? urlInfo.postId : null);
  
  if (urlInfo.isValid && finalPostId) {
    // Construire l'URL complète du site
    const baseUrl = 'https://www.jardin-iris.be/image-blog';
    const src = `${baseUrl}/${finalPostId}/${urlInfo.filename}`;
    
    console.log('[SupabaseImageUtils] Src généré:', {
      originalUrl: url,
      postId: finalPostId,
      filename: urlInfo.filename,
      generatedSrc: src
    });
    
    return src;
  }
  
  // Fallback pour les URLs non-Supabase
  console.log('[SupabaseImageUtils] URL non-Supabase, retour de l\'URL originale:', { url });
  return url;
}

/**
 * Supprime l'extension d'un nom de fichier
 * @param filename - Nom du fichier avec extension
 * @returns Nom du fichier sans extension
 */
function removeFileExtension(filename: string): string {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  
  return filename.substring(0, lastDotIndex);
}

/**
 * Convertit un texte en slug SEO-friendly
 * @param text - Texte à convertir
 * @returns Slug en minuscules avec tirets
 */
function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalise les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement les lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+|-+$/g, ''); // Supprime les tirets au début/fin
}

/**
 * Valide si une URL est une URL Supabase valide
 * @param url - URL à valider
 * @returns true si c'est une URL Supabase valide
 */
export function isSupabaseImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const supabasePattern = /zmgfaiprgbawcernymqa\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\/\d+\/.+$/;
  return supabasePattern.test(url);
}

/**
 * Extrait les informations d'une URL Supabase
 * @param url - URL Supabase
 * @returns Objet avec les informations extraites
 */
export function parseSupabaseUrl(url: string): {
  isValid: boolean;
  bucket: string | null;
  postId: string | null;
  filename: string | null;
  slug: string | null;
} {
  if (!isSupabaseImageUrl(url)) {
    return {
      isValid: false,
      bucket: null,
      postId: null,
      filename: null,
      slug: null
    };
  }
  
  const pattern = /zmgfaiprgbawcernymqa\.supabase\.co\/storage\/v1\/object\/public\/([^\/]+)\/(\d+)\/(.+)$/;
  const match = url.match(pattern);
  
  if (match) {
    const [, bucket, postId, filename] = match;
    const slug = removeFileExtension(filename);
    
    return {
      isValid: true,
      bucket,
      postId,
      filename,
      slug
    };
  }
  
  return {
    isValid: false,
    bucket: null,
    postId: null,
    filename: null,
    slug: null
  };
}
