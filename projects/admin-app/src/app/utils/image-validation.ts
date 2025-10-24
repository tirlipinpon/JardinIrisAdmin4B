/**
 * Utilitaires pour la validation et le diagnostic des images
 */

export interface ImageValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  details: {
    hasValidUrl: boolean;
    isSupabaseUrl: boolean;
    isHttpsUrl: boolean;
    isWebpFormat: boolean;
    hasValidAlt: boolean;
    altTextLength: number;
    urlLength: number;
  };
}

/**
 * Valide une image et retourne un rapport détaillé
 * @param imageUrl - URL de l'image
 * @param altText - Texte alternatif
 * @param chapitreId - ID du chapitre (optionnel)
 * @returns Résultat de validation détaillé
 */
export function validateImage(imageUrl: string, altText: string, chapitreId?: number): ImageValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  console.log(`[ImageValidation] 🔍 Validation de l'image pour le chapitre ${chapitreId || 'inconnu'}:`, {
    url: imageUrl,
    altText,
    chapitreId
  });

  // Validation de l'URL
  const hasValidUrl = validateImageUrl(imageUrl);
  if (!hasValidUrl) {
    issues.push('URL d\'image invalide ou malformée');
  }

  // Vérification Supabase
  const isSupabaseUrl = imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co');
  if (!isSupabaseUrl) {
    issues.push('URL ne pointe pas vers Supabase Storage');
    recommendations.push('Utiliser Supabase Storage pour de meilleures performances');
  } else {
    console.log('[ImageValidation] ✅ URL Supabase détectée:', { imageUrl });
    
    // Vérification supplémentaire pour les URLs Supabase
    const isCorrectBucket = imageUrl.includes('/jardin-iris-images-post/');
    if (!isCorrectBucket) {
      issues.push('URL Supabase ne pointe pas vers le bon bucket');
      recommendations.push('Utiliser le bucket jardin-iris-images-post');
    }
  }

  // Vérification HTTPS
  const isHttpsUrl = imageUrl.startsWith('https://');
  if (!isHttpsUrl) {
    issues.push('URL non sécurisée (HTTP au lieu de HTTPS)');
    recommendations.push('Utiliser HTTPS pour la sécurité');
  }

  // Vérification format WebP
  const isWebpFormat = imageUrl.toLowerCase().includes('.webp');
  if (!isWebpFormat) {
    issues.push('Format d\'image non optimisé (pas de WebP)');
    recommendations.push('Convertir en format WebP pour de meilleures performances');
  } else {
    console.log('[ImageValidation] ✅ Format WebP détecté:', { imageUrl });
  }

  // Validation du texte alternatif
  const hasValidAlt = Boolean(altText && altText.trim().length > 0);
  if (!hasValidAlt) {
    issues.push('Texte alternatif manquant ou vide');
    recommendations.push('Ajouter un texte alternatif descriptif pour l\'accessibilité');
  }

  // Vérification de la longueur du texte alternatif
  const altTextLength = altText?.length || 0;
  if (altTextLength > 125) {
    issues.push('Texte alternatif trop long (>125 caractères)');
    recommendations.push('Raccourcir le texte alternatif pour de meilleures performances SEO');
  } else if (altTextLength < 5) {
    issues.push('Texte alternatif trop court (<5 caractères)');
    recommendations.push('Ajouter plus de détails dans le texte alternatif');
  }

  // Vérification de la longueur de l'URL
  const urlLength = imageUrl?.length || 0;
  if (urlLength > 2000) {
    issues.push('URL trop longue (>2000 caractères)');
    recommendations.push('Utiliser des URLs plus courtes');
  }

  const isValid = issues.length === 0;

  const result: ImageValidationResult = {
    isValid,
    issues,
    recommendations,
    details: {
      hasValidUrl,
      isSupabaseUrl,
      isHttpsUrl,
      isWebpFormat,
      hasValidAlt,
      altTextLength,
      urlLength
    }
  };

  console.log(`[ImageValidation] 📊 Résultat de validation:`, {
    chapitreId,
    isValid,
    issuesCount: issues.length,
    recommendationsCount: recommendations.length,
    details: result.details
  });

  return result;
}

/**
 * Valide une URL d'image
 * @param url - URL à valider
 * @returns true si l'URL est valide
 */
function validateImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un rapport de validation pour un ensemble d'images
 * @param images - Tableau d'images à valider
 * @returns Rapport global de validation
 */
export function generateImageValidationReport(images: Array<{
  chapitre_id: number;
  url_Image: string;
  chapitre_key_word: string;
}>): {
  totalImages: number;
  validImages: number;
  invalidImages: number;
  successRate: number;
  commonIssues: string[];
  recommendations: string[];
  details: Array<{
    chapitre_id: number;
    validation: ImageValidationResult;
  }>;
} {
  console.log(`[ImageValidation] 📋 Génération du rapport de validation pour ${images.length} image(s)`);

  const details = images.map(image => ({
    chapitre_id: image.chapitre_id,
    validation: validateImage(image.url_Image, image.chapitre_key_word, image.chapitre_id)
  }));

  const validImages = details.filter(d => d.validation.isValid).length;
  const invalidImages = details.length - validImages;
  const successRate = details.length > 0 ? Math.round((validImages / details.length) * 100) : 0;

  // Collecter les problèmes communs
  const allIssues = details.flatMap(d => d.validation.issues);
  const issueCounts = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonIssues = Object.entries(issueCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => `${issue} (${count}x)`);

  // Collecter les recommandations
  const allRecommendations = details.flatMap(d => d.validation.recommendations);
  const uniqueRecommendations = [...new Set(allRecommendations)];

  const report = {
    totalImages: images.length,
    validImages,
    invalidImages,
    successRate,
    commonIssues,
    recommendations: uniqueRecommendations,
    details
  };

  console.log(`[ImageValidation] 📈 Rapport de validation généré:`, {
    totalImages: report.totalImages,
    validImages: report.validImages,
    invalidImages: report.invalidImages,
    successRate: `${report.successRate}%`,
    commonIssuesCount: report.commonIssues.length,
    recommendationsCount: report.recommendations.length
  });

  return report;
}

/**
 * Vérifie si une image est déjà présente dans un contenu HTML
 * @param content - Contenu HTML
 * @param chapitreId - ID du chapitre
 * @returns true si l'image est présente
 */
export function isImageAlreadyInjected(content: string, chapitreId: number): boolean {
  const spanRegex = new RegExp(`<span id=(?:["'])paragraphe-${chapitreId}(?:["'])>([\\s\\S]*?)<\\/span>`, 'g');
  const match = spanRegex.exec(content);
  
  if (match) {
    const spanContent = match[1];
    const hasImage = spanContent.includes('class="randomCropImage"');
    
    console.log(`[ImageValidation] 🔍 Vérification de l'injection pour le chapitre ${chapitreId}:`, {
      hasImage,
      spanContentLength: spanContent.length
    });
    
    return hasImage;
  }
  
  return false;
}

/**
 * Compte le nombre d'images injectées dans un contenu
 * @param content - Contenu HTML
 * @returns Nombre d'images trouvées
 */
export function countInjectedImages(content: string): number {
  const imgRegex = /<img[^>]*class="randomCropImage"[^>]*>/g;
  const matches = content.match(imgRegex);
  const count = matches ? matches.length : 0;
  
  console.log(`[ImageValidation] 🔢 Nombre d'images injectées détectées: ${count}`);
  return count;
}
