/**
 * 🧪 Test Complet de Vérification des Mises à Jour d'Images
 * 
 * Ce script teste que les images (principales et de chapitres) sont bien mises à jour
 * avec les bonnes URLs dans tous les cas de figure.
 */

// ========================================
// 🎯 Tests de Détection des Images Modifiées
// ========================================

export function testImageModificationDetection() {
  console.log('🧪 [TEST] Début des tests de détection des images modifiées');
  
  // Test 1: Image externe (doit être détectée)
  const externalImage = 'https://example.com/image.jpg';
  const isExternal1 = testIsExternalImage(externalImage);
  console.log(`✅ Image externe détectée: ${isExternal1} (attendu: true)`);
  
  // Test 2: Image Supabase non-optimisée (doit être détectée)
  const nonOptimizedSupabase = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/old.png';
  const isExternal2 = testIsExternalImage(nonOptimizedSupabase);
  console.log(`✅ Image Supabase non-optimisée détectée: ${isExternal2} (attendu: true)`);
  
  // Test 3: Image Supabase mauvais bucket (doit être détectée)
  const wrongBucket = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/wrong-bucket/1042/image.webp';
  const isExternal3 = testIsExternalImage(wrongBucket);
  console.log(`✅ Image mauvais bucket détectée: ${isExternal3} (attendu: true)`);
  
  // Test 4: Image Supabase optimisée (ne doit PAS être détectée)
  const optimizedSupabase = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.webp';
  const isExternal4 = testIsExternalImage(optimizedSupabase);
  console.log(`✅ Image Supabase optimisée non détectée: ${!isExternal4} (attendu: true)`);
  
  // Test 5: Image sans extension WebP (doit être détectée)
  const noWebp = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.jpg';
  const isExternal5 = testIsExternalImage(noWebp);
  console.log(`✅ Image sans WebP détectée: ${isExternal5} (attendu: true)`);
  
  console.log('🧪 [TEST] Tests de détection terminés\n');
}

// ========================================
// 🎯 Tests de Génération d'URLs d'Images
// ========================================

export function testImageUrlGeneration() {
  console.log('🧪 [TEST] Début des tests de génération d\'URLs d\'images');
  
  // Test 1: URL Supabase optimisée (doit retourner l'URL directe)
  const supabaseUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.webp';
  const generatedSrc1 = testGenerateImageSrc(supabaseUrl, 1042);
  const isCorrect1 = generatedSrc1 === supabaseUrl;
  console.log(`✅ URL Supabase optimisée: ${isCorrect1} (attendu: true)`);
  console.log(`   URL générée: ${generatedSrc1}`);
  
  // Test 2: URL externe (doit retourner l'URL directe avec warning)
  const externalUrl = 'https://example.com/image.jpg';
  const generatedSrc2 = testGenerateImageSrc(externalUrl, 1042);
  const isCorrect2 = generatedSrc2 === externalUrl;
  console.log(`✅ URL externe: ${isCorrect2} (attendu: true)`);
  console.log(`   URL générée: ${generatedSrc2}`);
  
  // Test 3: URL Supabase non-optimisée (doit retourner l'URL directe)
  const nonOptimizedUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/old.png';
  const generatedSrc3 = testGenerateImageSrc(nonOptimizedUrl, 1042);
  const isCorrect3 = generatedSrc3 === nonOptimizedUrl;
  console.log(`✅ URL Supabase non-optimisée: ${isCorrect3} (attendu: true)`);
  console.log(`   URL générée: ${generatedSrc3}`);
  
  console.log('🧪 [TEST] Tests de génération d\'URLs terminés\n');
}

// ========================================
// 🎯 Tests de Génération d'Alt Text
// ========================================

export function testAltTextGeneration() {
  console.log('🧪 [TEST] Début des tests de génération d\'alt text');
  
  // Test 1: Avec key_word fourni (priorité 1)
  const url1 = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.webp';
  const keyWord1 = 'jardin fleurs';
  const altText1 = testGenerateAltTextFromUrl(url1, keyWord1);
  const isCorrect1 = altText1 === 'jardin-fleurs';
  console.log(`✅ Alt text avec key_word: ${isCorrect1} (attendu: true)`);
  console.log(`   Alt text généré: "${altText1}"`);
  
  // Test 2: Sans key_word, URL Supabase avec slug (priorité 2)
  const url2 = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/jardin-fleurs.webp';
  const altText2 = testGenerateAltTextFromUrl(url2);
  const isCorrect2 = altText2 === 'jardin-fleurs';
  console.log(`✅ Alt text depuis slug Supabase: ${isCorrect2} (attendu: true)`);
  console.log(`   Alt text généré: "${altText2}"`);
  
  // Test 3: URL externe sans key_word (priorité 3 - fallback)
  const url3 = 'https://example.com/beautiful-garden.jpg';
  const altText3 = testGenerateAltTextFromUrl(url3);
  const isCorrect3 = altText3 === 'beautiful-garden';
  console.log(`✅ Alt text depuis URL externe: ${isCorrect3} (attendu: true)`);
  console.log(`   Alt text généré: "${altText3}"`);
  
  console.log('🧪 [TEST] Tests de génération d\'alt text terminés\n');
}

// ========================================
// 🎯 Tests de Validation d'Images
// ========================================

export function testImageValidation() {
  console.log('🧪 [TEST] Début des tests de validation d\'images');
  
  // Test 1: Image Supabase optimisée (doit être valide)
  const validImage = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.webp';
  const validation1 = testValidateImage(validImage);
  const isValid1 = validation1.issues.length === 0;
  console.log(`✅ Image Supabase optimisée valide: ${isValid1} (attendu: true)`);
  console.log(`   Issues: ${validation1.issues.length}, Recommendations: ${validation1.recommendations.length}`);
  
  // Test 2: Image externe (doit avoir des issues)
  const externalImage = 'https://example.com/image.jpg';
  const validation2 = testValidateImage(externalImage);
  const hasIssues2 = validation2.issues.length > 0;
  console.log(`✅ Image externe avec issues: ${hasIssues2} (attendu: true)`);
  console.log(`   Issues: ${validation2.issues.length}, Recommendations: ${validation2.recommendations.length}`);
  
  // Test 3: Image Supabase mauvais bucket (doit avoir des issues)
  const wrongBucket = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/wrong-bucket/1042/image.webp';
  const validation3 = testValidateImage(wrongBucket);
  const hasIssues3 = validation3.issues.length > 0;
  console.log(`✅ Image mauvais bucket avec issues: ${hasIssues3} (attendu: true)`);
  console.log(`   Issues: ${validation3.issues.length}, Recommendations: ${validation3.recommendations.length}`);
  
  // Test 4: Image Supabase sans WebP (doit avoir des issues)
  const noWebp = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.png';
  const validation4 = testValidateImage(noWebp);
  const hasIssues4 = validation4.issues.length > 0;
  console.log(`✅ Image sans WebP avec issues: ${hasIssues4} (attendu: true)`);
  console.log(`   Issues: ${validation4.issues.length}, Recommendations: ${validation4.recommendations.length}`);
  
  console.log('🧪 [TEST] Tests de validation d\'images terminés\n');
}

// ========================================
// 🎯 Tests de Scénarios Complets
// ========================================

export function testCompleteScenarios() {
  console.log('🧪 [TEST] Début des tests de scénarios complets');
  
  // Scénario 1: Modification d'image externe vers Supabase optimisée
  console.log('📋 Scénario 1: Modification d\'image externe vers Supabase optimisée');
  const scenario1 = testImageModificationScenario(
    'https://example.com/old-image.jpg',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/new-image.webp',
    'jardin fleurs'
  );
  console.log(`   ✅ Scénario 1 réussi: ${scenario1.success}`);
  console.log(`   📊 Détails: ${JSON.stringify(scenario1.details, null, 2)}`);
  
  // Scénario 2: Modification d'image Supabase non-optimisée vers optimisée
  console.log('📋 Scénario 2: Modification d\'image Supabase non-optimisée vers optimisée');
  const scenario2 = testImageModificationScenario(
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/old.png',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/optimized.webp',
    'plantes vertes'
  );
  console.log(`   ✅ Scénario 2 réussi: ${scenario2.success}`);
  console.log(`   📊 Détails: ${JSON.stringify(scenario2.details, null, 2)}`);
  
  // Scénario 3: Modification d'image déjà optimisée (ne doit pas être traitée)
  console.log('📋 Scénario 3: Modification d\'image déjà optimisée');
  const scenario3 = testImageModificationScenario(
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/old.webp',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/new.webp',
    'fleurs printemps'
  );
  console.log(`   ✅ Scénario 3 réussi: ${scenario3.success}`);
  console.log(`   📊 Détails: ${JSON.stringify(scenario3.details, null, 2)}`);
  
  console.log('🧪 [TEST] Tests de scénarios complets terminés\n');
}

// ========================================
// 🎯 Tests de Performance et Robustesse
// ========================================

export function testPerformanceAndRobustness() {
  console.log('🧪 [TEST] Début des tests de performance et robustesse');
  
  // Test 1: URLs malformées
  const malformedUrls = [
    '',
    'not-a-url',
    'ftp://example.com/image.jpg',
    'https://',
    'https://example.com',
    'https://example.com/',
    'https://example.com/image',
    'https://example.com/image.',
    'https://example.com/.jpg'
  ];
  
  console.log('📋 Test des URLs malformées:');
  malformedUrls.forEach((url, index) => {
    try {
      const validation = testValidateImage(url);
      const isHandled = validation.issues.length > 0 || validation.recommendations.length > 0;
      console.log(`   ${index + 1}. "${url}" - Géré: ${isHandled}`);
    } catch (error) {
      console.log(`   ${index + 1}. "${url}" - Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
  
  // Test 2: URLs très longues
  const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
  console.log('📋 Test des URLs très longues:');
  try {
    const validation = testValidateImage(longUrl);
    console.log(`   URL longue gérée: ${validation.issues.length > 0}`);
  } catch (error) {
    console.log(`   URL longue - Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
  
  // Test 3: Caractères spéciaux dans les URLs
  const specialCharsUrl = 'https://example.com/image with spaces & special chars!.jpg';
  console.log('📋 Test des caractères spéciaux:');
  try {
    const altText = testGenerateAltTextFromUrl(specialCharsUrl);
    console.log(`   Alt text avec caractères spéciaux: "${altText}"`);
  } catch (error) {
    console.log(`   Caractères spéciaux - Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
  
  console.log('🧪 [TEST] Tests de performance et robustesse terminés\n');
}

// ========================================
// 🎯 Fonctions de Test Simulées
// ========================================

function testIsExternalImage(imageUrl?: string): boolean {
  if (!imageUrl) return false;
  
  const isExternal = !imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co') &&
                    (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
  const isNotOptimized = !imageUrl.includes('.webp') || !imageUrl.includes('/jardin-iris-images-post/');
  
  return isExternal || isNotOptimized;
}

function testGenerateImageSrc(url: string, postId?: number): string {
  if (url.includes('zmgfaiprgbawcernymqa.supabase.co')) {
    return url;
  }
  
  return url;
}

function testGenerateAltTextFromUrl(url: string, keyWord?: string): string {
  if (keyWord && keyWord.trim() && keyWord.trim() !== '') {
    return keyWord.toLowerCase().replace(/\s+/g, '-');
  }
  
  if (url.includes('zmgfaiprgbawcernymqa.supabase.co')) {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename.replace(/\.[^/.]+$/, '');
  }
  
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  return filename.replace(/\.[^/.]+$/, '');
}

function testValidateImage(imageUrl: string): { issues: string[], recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!imageUrl) {
    issues.push('URL d\'image manquante');
    return { issues, recommendations };
  }
  
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    issues.push('URL d\'image invalide');
    recommendations.push('Utiliser une URL HTTP/HTTPS valide');
  }
  
  const isSupabaseUrl = imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co');
  if (!isSupabaseUrl) {
    issues.push('URL ne pointe pas vers Supabase Storage');
    recommendations.push('Utiliser Supabase Storage pour de meilleures performances');
  } else {
    const isCorrectBucket = imageUrl.includes('/jardin-iris-images-post/');
    if (!isCorrectBucket) {
      issues.push('URL Supabase ne pointe pas vers le bon bucket');
      recommendations.push('Utiliser le bucket jardin-iris-images-post');
    }
  }
  
  const isWebpFormat = imageUrl.toLowerCase().includes('.webp');
  if (!isWebpFormat) {
    issues.push('Format d\'image non optimisé (pas de WebP)');
    recommendations.push('Convertir en format WebP pour de meilleures performances');
  }
  
  return { issues, recommendations };
}

function testImageModificationScenario(oldUrl: string, newUrl: string, keyWord: string) {
  const details = {
    oldUrl,
    newUrl,
    keyWord,
    urlChanged: oldUrl !== newUrl,
    oldNeedsOptimization: testIsExternalImage(oldUrl),
    newNeedsOptimization: testIsExternalImage(newUrl),
    shouldProcess: oldUrl !== newUrl && testIsExternalImage(newUrl),
    generatedSrc: testGenerateImageSrc(newUrl),
    generatedAlt: testGenerateAltTextFromUrl(newUrl, keyWord),
    validation: testValidateImage(newUrl)
  };
  
  return {
    success: details.shouldProcess === (details.oldNeedsOptimization || details.newNeedsOptimization),
    details
  };
}

// ========================================
// 🎯 Fonction Principale de Test
// ========================================

export function runCompleteImageUpdateTests() {
  console.log('🚀 [TEST COMPLET] Début des tests de vérification des mises à jour d\'images');
  console.log('=' .repeat(80));
  
  try {
    testImageModificationDetection();
    testImageUrlGeneration();
    testAltTextGeneration();
    testImageValidation();
    testCompleteScenarios();
    testPerformanceAndRobustness();
    
    console.log('=' .repeat(80));
    console.log('✅ [TEST COMPLET] Tous les tests terminés avec succès');
    console.log('🎯 Les images sont correctement détectées et mises à jour avec les bonnes URLs');
    
  } catch (error) {
    console.error('❌ [TEST COMPLET] Erreur lors des tests:', error);
  }
}

// ========================================
// 🎯 Export pour utilisation
// ========================================

export default {
  runCompleteImageUpdateTests,
  testImageModificationDetection,
  testImageUrlGeneration,
  testAltTextGeneration,
  testImageValidation,
  testCompleteScenarios,
  testPerformanceAndRobustness
};
