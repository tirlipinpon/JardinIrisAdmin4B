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
    return url;
  }

  // Vérifier si c'est une URL Supabase
  const supabasePattern = /zmgfaiprgbawcernymqa\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\/\d+\/(.+)$/;
  const match = url.match(supabasePattern);
  
  if (match && match[1]) {
    const fullFilename = match[1];
    // Extraire le nom sans extension
    const slug = removeFileExtension(fullFilename);
    return slug;
  }
  
  // Si ce n'est pas une URL Supabase, retourner l'URL originale
  return url;
}

/**
 * Génère l'alt text à partir d'une URL Supabase
 * @param url - URL complète Supabase
 * @param keyWord - Mot-clé optionnel (priorité absolue)
 * @returns Alt text SEO-friendly
 */
export function generateAltTextFromUrl(url: string, keyWord?: string): string {
  // Priorité 1: Utiliser le key_word s'il est fourni et valide
  if (keyWord && keyWord.trim() && keyWord.trim() !== '') {
    const altText = textToSlug(keyWord);
    return altText;
  }
  
  // Priorité 2: Extraire le slug de l'URL Supabase
  if (isSupabaseImageUrl(url)) {
    const urlInfo = parseSupabaseUrl(url);
    if (urlInfo.isValid && urlInfo.slug) {
      return urlInfo.slug;
    }
  }
  
  // Priorité 3: Fallback - utiliser le nom de fichier sans extension
  const altText = removeFileExtension(url);
  return altText;
}

/**
 * Génère le src pour l'image en convertissant l'URL Supabase vers l'URL jardin-iris.be
 * @param url - URL complète Supabase stockée en base de données
 * @param postId - ID du post (optionnel, pour logging)
 * @returns URL jardin-iris.be (format final attendu)
 */
export function generateImageSrc(url: string, postId?: number): string {
  console.log(`[generateImageSrc] Transformation URL: ${url}`);
  
  // Vérifier si c'est une URL Supabase valide
  if (isSupabaseImageUrl(url)) {
    console.log(`[generateImageSrc] URL Supabase détectée`);
    const urlInfo = parseSupabaseUrl(url);
    
    if (urlInfo.isValid && urlInfo.postId && urlInfo.filename) {
      // Construire l'URL jardin-iris.be
      const jardinIrisUrl = `https://www.jardin-iris.be/image-blog/${urlInfo.postId}/${urlInfo.filename}`;
      console.log(`[generateImageSrc] URL transformée vers jardin-iris.be: ${jardinIrisUrl}`);
      return jardinIrisUrl;
    } else {
      console.log(`[generateImageSrc] URL Supabase invalide ou incomplète`);
    }
  } else {
    console.log(`[generateImageSrc] URL non-Supabase détectée`);
  }
  
  // Fallback pour les URLs non-Supabase
  console.log(`[generateImageSrc] Fallback - URL conservée: ${url}`);
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
