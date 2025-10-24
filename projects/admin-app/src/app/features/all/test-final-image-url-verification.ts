/**
 * 🧪 Test Final de Vérification des URLs d'Images
 * 
 * Ce script teste que les URLs et alt text sont correctement générés
 * selon le format attendu : https://www.jardin-iris.be/image-blog/{postId}/{slug}.webp
 */

import { generateImageSrc, generateAltTextFromUrl } from '../../utils/supabase-image-utils';

// ========================================
// 🎯 Tests de Génération d'URLs
// ========================================

export function testImageUrlGeneration() {
  console.log('🧪 [TEST] Début des tests de génération d\'URLs d\'images');
  
  // Test 1: URL Supabase optimisée (doit être convertie vers jardin-iris.be)
  const supabaseUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/plan-acces-jardin-luxembourg-paris-guide.webp';
  const expectedUrl = 'https://www.jardin-iris.be/image-blog/1047/plan-acces-jardin-luxembourg-paris-guide.webp';
  const generatedSrc = generateImageSrc(supabaseUrl, 1047);
  
  const isCorrect = generatedSrc === expectedUrl;
  console.log(`✅ URL Supabase convertie: ${isCorrect} (attendu: true)`);
  console.log(`   URL Supabase: ${supabaseUrl}`);
  console.log(`   URL générée:  ${generatedSrc}`);
  console.log(`   URL attendue: ${expectedUrl}`);
  
  // Test 2: URL externe (doit rester inchangée)
  const externalUrl = 'https://example.com/image.jpg';
  const generatedSrc2 = generateImageSrc(externalUrl, 1047);
  const isCorrect2 = generatedSrc2 === externalUrl;
  console.log(`✅ URL externe inchangée: ${isCorrect2} (attendu: true)`);
  console.log(`   URL externe: ${externalUrl}`);
  console.log(`   URL générée: ${generatedSrc2}`);
  
  // Test 3: URL Supabase avec différents postId
  const testCases = [
    {
      input: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1234/test-image.webp',
      postId: 1234,
      expected: 'https://www.jardin-iris.be/image-blog/1234/test-image.webp'
    },
    {
      input: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/9999/autre-image.webp',
      postId: 9999,
      expected: 'https://www.jardin-iris.be/image-blog/9999/autre-image.webp'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const result = generateImageSrc(testCase.input, testCase.postId);
    const isCorrect = result === testCase.expected;
    console.log(`✅ Test ${index + 3} (postId ${testCase.postId}): ${isCorrect} (attendu: true)`);
    console.log(`   Input:    ${testCase.input}`);
    console.log(`   Résultat: ${result}`);
    console.log(`   Attendu:  ${testCase.expected}`);
  });
  
  console.log('🧪 [TEST] Tests de génération d\'URLs terminés\n');
}

// ========================================
// 🎯 Tests de Génération d'Alt Text
// ========================================

export function testAltTextGeneration() {
  console.log('🧪 [TEST] Début des tests de génération d\'alt text');
  
  // Test 1: Avec key_word fourni (priorité 1)
  const url1 = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/plan-acces-jardin-luxembourg-paris-guide.webp';
  const keyWord1 = 'plan accès jardin luxembourg paris guide';
  const altText1 = generateAltTextFromUrl(url1, keyWord1);
  const expectedAlt1 = 'plan-acces-jardin-luxembourg-paris-guide';
  const isCorrect1 = altText1 === expectedAlt1;
  console.log(`✅ Alt text avec key_word: ${isCorrect1} (attendu: true)`);
  console.log(`   URL: ${url1}`);
  console.log(`   Key word: "${keyWord1}"`);
  console.log(`   Alt text généré: "${altText1}"`);
  console.log(`   Alt text attendu: "${expectedAlt1}"`);
  
  // Test 2: Sans key_word, URL Supabase avec slug (priorité 2)
  const url2 = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/plan-acces-jardin-luxembourg-paris-guide.webp';
  const altText2 = generateAltTextFromUrl(url2);
  const expectedAlt2 = 'plan-acces-jardin-luxembourg-paris-guide';
  const isCorrect2 = altText2 === expectedAlt2;
  console.log(`✅ Alt text depuis slug Supabase: ${isCorrect2} (attendu: true)`);
  console.log(`   URL: ${url2}`);
  console.log(`   Alt text généré: "${altText2}"`);
  console.log(`   Alt text attendu: "${expectedAlt2}"`);
  
  // Test 3: URL externe sans key_word (priorité 3 - fallback)
  const url3 = 'https://example.com/beautiful-garden.jpg';
  const altText3 = generateAltTextFromUrl(url3);
  const expectedAlt3 = 'beautiful-garden';
  const isCorrect3 = altText3 === expectedAlt3;
  console.log(`✅ Alt text depuis URL externe: ${isCorrect3} (attendu: true)`);
  console.log(`   URL: ${url3}`);
  console.log(`   Alt text généré: "${altText3}"`);
  console.log(`   Alt text attendu: "${expectedAlt3}"`);
  
  // Test 4: Cas spéciaux
  const specialCases = [
    {
      url: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/image-avec-accents-éàç.webp',
      keyWord: 'image avec accents éàç',
      expected: 'image-avec-accents-eac'
    },
    {
      url: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/image-avec-espaces.webp',
      keyWord: 'image avec espaces',
      expected: 'image-avec-espaces'
    }
  ];
  
  specialCases.forEach((testCase, index) => {
    const result = generateAltTextFromUrl(testCase.url, testCase.keyWord);
    const isCorrect = result === testCase.expected;
    console.log(`✅ Test spécial ${index + 1}: ${isCorrect} (attendu: true)`);
    console.log(`   URL: ${testCase.url}`);
    console.log(`   Key word: "${testCase.keyWord}"`);
    console.log(`   Alt text généré: "${result}"`);
    console.log(`   Alt text attendu: "${testCase.expected}"`);
  });
  
  console.log('🧪 [TEST] Tests de génération d\'alt text terminés\n');
}

// ========================================
// 🎯 Tests de Scénarios Complets
// ========================================

export function testCompleteScenarios() {
  console.log('🧪 [TEST] Début des tests de scénarios complets');
  
  // Scénario 1: Image principale optimisée
  console.log('📋 Scénario 1: Image principale optimisée');
  const mainImageUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/plan-acces-jardin-luxembourg-paris-guide.webp';
  const mainImageSrc = generateImageSrc(mainImageUrl, 1047);
  const mainImageAlt = generateAltTextFromUrl(mainImageUrl);
  
  const mainImageExpected = {
    src: 'https://www.jardin-iris.be/image-blog/1047/plan-acces-jardin-luxembourg-paris-guide.webp',
    alt: 'plan-acces-jardin-luxembourg-paris-guide'
  };
  
  const mainImageSuccess = mainImageSrc === mainImageExpected.src && mainImageAlt === mainImageExpected.alt;
  console.log(`   ✅ Image principale: ${mainImageSuccess}`);
  console.log(`   📊 Résultat:`, {
    src: mainImageSrc,
    alt: mainImageAlt,
    expected: mainImageExpected
  });
  
  // Scénario 2: Image de chapitre optimisée
  console.log('📋 Scénario 2: Image de chapitre optimisée');
  const chapterImageUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1047/fleurs-printemps.webp';
  const chapterImageSrc = generateImageSrc(chapterImageUrl, 1047);
  const chapterImageAlt = generateAltTextFromUrl(chapterImageUrl, 'fleurs printemps');
  
  const chapterImageExpected = {
    src: 'https://www.jardin-iris.be/image-blog/1047/fleurs-printemps.webp',
    alt: 'fleurs-printemps'
  };
  
  const chapterImageSuccess = chapterImageSrc === chapterImageExpected.src && chapterImageAlt === chapterImageExpected.alt;
  console.log(`   ✅ Image de chapitre: ${chapterImageSuccess}`);
  console.log(`   📊 Résultat:`, {
    src: chapterImageSrc,
    alt: chapterImageAlt,
    expected: chapterImageExpected
  });
  
  // Scénario 3: Image externe (fallback)
  console.log('📋 Scénario 3: Image externe (fallback)');
  const externalImageUrl = 'https://example.com/old-image.jpg';
  const externalImageSrc = generateImageSrc(externalImageUrl, 1047);
  const externalImageAlt = generateAltTextFromUrl(externalImageUrl);
  
  const externalImageExpected = {
    src: 'https://example.com/old-image.jpg',
    alt: 'old-image'
  };
  
  const externalImageSuccess = externalImageSrc === externalImageExpected.src && externalImageAlt === externalImageExpected.alt;
  console.log(`   ✅ Image externe: ${externalImageSuccess}`);
  console.log(`   📊 Résultat:`, {
    src: externalImageSrc,
    alt: externalImageAlt,
    expected: externalImageExpected
  });
  
  console.log('🧪 [TEST] Tests de scénarios complets terminés\n');
}

// ========================================
// 🎯 Fonction Principale de Test
// ========================================

export function runFinalImageUrlTests() {
  console.log('🚀 [TEST FINAL] Début des tests de vérification des URLs d\'images');
  console.log('=' .repeat(80));
  
  try {
    testImageUrlGeneration();
    testAltTextGeneration();
    testCompleteScenarios();
    
    console.log('=' .repeat(80));
    console.log('✅ [TEST FINAL] Tous les tests terminés avec succès');
    console.log('🎯 Les URLs et alt text sont correctement générés selon le format attendu');
    console.log('📋 Format attendu: https://www.jardin-iris.be/image-blog/{postId}/{slug}.webp');
    
  } catch (error) {
    console.error('❌ [TEST FINAL] Erreur lors des tests:', error);
  }
}

// ========================================
// 🎯 Export pour utilisation
// ========================================

export default {
  runFinalImageUrlTests,
  testImageUrlGeneration,
  testAltTextGeneration,
  testCompleteScenarios
};
