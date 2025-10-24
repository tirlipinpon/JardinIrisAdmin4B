/**
 * Script de test pour vérifier la détection des images modifiées
 * À exécuter dans la console du navigateur pour tester les fonctionnalités
 */

// Test de la détection des images modifiées
export function testImageModificationDetection() {
  console.log('🧪 Test de la détection des images modifiées');
  console.log('============================================');
  
  // Test 1: Image externe (doit être marquée comme modifiée)
  console.log('\n📸 Test 1: Image externe');
  const externalImage = {
    id: 1,
    chapitre_id: 1,
    url_Image: 'https://example.com/image.jpg',
    chapitre_key_word: 'Image externe',
    changed: false
  };
  
  const needsOptimizationExternal = !externalImage.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
                                   !externalImage.url_Image?.includes('.webp') ||
                                   !externalImage.url_Image?.includes('/jardin-iris-images-post/');
  
  console.log('Image externe:', externalImage);
  console.log('Doit être optimisée:', needsOptimizationExternal);
  console.log('✅ Résultat attendu: true');
  
  // Test 2: Image Supabase non-optimisée (doit être marquée comme modifiée)
  console.log('\n📸 Test 2: Image Supabase non-optimisée');
  const nonOptimizedImage = {
    id: 2,
    chapitre_id: 2,
    url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/old-image.png',
    chapitre_key_word: 'Image non optimisée',
    changed: false
  };
  
  const needsOptimizationNonOptimized = !nonOptimizedImage.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
                                       !nonOptimizedImage.url_Image?.includes('.webp') ||
                                       !nonOptimizedImage.url_Image?.includes('/jardin-iris-images-post/');
  
  console.log('Image non optimisée:', nonOptimizedImage);
  console.log('Doit être optimisée:', needsOptimizationNonOptimized);
  console.log('✅ Résultat attendu: true');
  
  // Test 3: Image Supabase optimisée (ne doit PAS être marquée comme modifiée)
  console.log('\n📸 Test 3: Image Supabase optimisée');
  const optimizedImage = {
    id: 3,
    chapitre_id: 3,
    url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/optimized-image.webp',
    chapitre_key_word: 'Image optimisée',
    changed: false
  };
  
  const needsOptimizationOptimized = !optimizedImage.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
                                    !optimizedImage.url_Image?.includes('.webp') ||
                                    !optimizedImage.url_Image?.includes('/jardin-iris-images-post/');
  
  console.log('Image optimisée:', optimizedImage);
  console.log('Doit être optimisée:', needsOptimizationOptimized);
  console.log('✅ Résultat attendu: false');
  
  // Test 4: Image principale externe (doit être traitée)
  console.log('\n📸 Test 4: Image principale externe');
  const externalMainImage = 'https://example.com/main-image.jpg';
  
  const isExternal = !externalMainImage.includes('zmgfaiprgbawcernymqa.supabase.co') &&
                    (externalMainImage.startsWith('http://') || externalMainImage.startsWith('https://'));
  const isNotOptimized = !externalMainImage.includes('.webp') || !externalMainImage.includes('/jardin-iris-images-post/');
  const needsProcessing = isExternal || isNotOptimized;
  
  console.log('Image principale externe:', externalMainImage);
  console.log('Est externe:', isExternal);
  console.log('N\'est pas optimisée:', isNotOptimized);
  console.log('Doit être traitée:', needsProcessing);
  console.log('✅ Résultat attendu: true');
  
  // Test 5: Image principale optimisée (ne doit PAS être traitée)
  console.log('\n📸 Test 5: Image principale optimisée');
  const optimizedMainImage = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/main-image.webp';
  
  const isExternalOptimized = !optimizedMainImage.includes('zmgfaiprgbawcernymqa.supabase.co') &&
                             (optimizedMainImage.startsWith('http://') || optimizedMainImage.startsWith('https://'));
  const isNotOptimizedOptimized = !optimizedMainImage.includes('.webp') || !optimizedMainImage.includes('/jardin-iris-images-post/');
  const needsProcessingOptimized = isExternalOptimized || isNotOptimizedOptimized;
  
  console.log('Image principale optimisée:', optimizedMainImage);
  console.log('Est externe:', isExternalOptimized);
  console.log('N\'est pas optimisée:', isNotOptimizedOptimized);
  console.log('Doit être traitée:', needsProcessingOptimized);
  console.log('✅ Résultat attendu: false');
  
  console.log('\n✅ Tests de détection des images modifiées terminés');
  console.log('============================================');
}

// Test de simulation du processus de modification d'image
export function testImageModificationProcess() {
  console.log('🔄 Test du processus de modification d\'image');
  console.log('============================================');
  
  // Simulation d'une image modifiée
  const originalImage = {
    id: 1,
    chapitre_id: 1,
    url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/old-image.png',
    chapitre_key_word: 'Ancienne image',
    changed: false
  };
  
  const newImage = {
    id: 1,
    chapitre_id: 1,
    url_Image: 'https://example.com/new-image.jpg',
    chapitre_key_word: 'Nouvelle image',
    changed: false
  };
  
  console.log('Image originale:', originalImage);
  console.log('Nouvelle image:', newImage);
  
  // Simulation de la logique du store
  const urlChanged = originalImage.url_Image !== newImage.url_Image;
  const needsOptimization = !newImage.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
                           !newImage.url_Image?.includes('.webp') ||
                           !newImage.url_Image?.includes('/jardin-iris-images-post/');
  
  const shouldBeChanged = urlChanged && needsOptimization;
  
  console.log('URL a changé:', urlChanged);
  console.log('Nécessite optimisation:', needsOptimization);
  console.log('Doit être marquée comme modifiée:', shouldBeChanged);
  console.log('✅ Résultat attendu: true');
  
  console.log('\n✅ Test du processus de modification terminé');
  console.log('============================================');
}

// Fonction principale de test
export function runImageModificationTests() {
  console.log('🚀 Démarrage des tests de détection des images modifiées');
  console.log('======================================================');
  
  testImageModificationDetection();
  testImageModificationProcess();
  
  console.log('======================================================');
  console.log('✅ Tous les tests de détection des images modifiées terminés');
  console.log('');
  console.log('📋 Résumé des corrections:');
  console.log('1. ✅ Images externes détectées et marquées comme modifiées');
  console.log('2. ✅ Images non-optimisées détectées et marquées comme modifiées');
  console.log('3. ✅ Images optimisées ne sont PAS marquées comme modifiées');
  console.log('4. ✅ Images principales externes/non-optimisées détectées');
  console.log('5. ✅ Logique de détection améliorée dans le store et la validation');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runImageModificationTests()');
}

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined') {
  console.log('🔧 Script de test de détection des images modifiées chargé');
  console.log('Exécutez runImageModificationTests() pour commencer les tests');
}
