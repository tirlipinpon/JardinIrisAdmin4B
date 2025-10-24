/**
 * Script de test pour vérifier les corrections d'optimisation des images
 * À exécuter dans la console du navigateur pour tester les fonctionnalités
 */

import {
    generateImageSrc,
    generateAltTextFromUrl,
    isSupabaseImageUrl,
    parseSupabaseUrl
} from '../../../utils/supabase-image-utils';
import { validateImage } from '../../../utils/image-validation';

// Test des corrections d'optimisation des images
export function testImageOptimizationFix() {
  console.log('🧪 Test des corrections d\'optimisation des images');
  console.log('================================================');
  
  // Test 1: URL Supabase optimisée (format correct)
  console.log('\n📸 Test 1: URL Supabase optimisée');
  const optimizedSupabaseUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp';
  
  console.log('URL testée:', optimizedSupabaseUrl);
  console.log('isSupabaseImageUrl:', isSupabaseImageUrl(optimizedSupabaseUrl));
  
  const parsedUrl = parseSupabaseUrl(optimizedSupabaseUrl);
  console.log('parseSupabaseUrl:', parsedUrl);
  
  const generatedSrc = generateImageSrc(optimizedSupabaseUrl, 1042);
  console.log('generateImageSrc:', generatedSrc);
  console.log('✅ URLs identiques:', optimizedSupabaseUrl === generatedSrc);
  
  const altText = generateAltTextFromUrl(optimizedSupabaseUrl, 'Allée forêt automne');
  console.log('generateAltTextFromUrl:', altText);
  
  const validation = validateImage(optimizedSupabaseUrl, altText, 1);
  console.log('validateImage:', validation);
  console.log('✅ Image valide:', validation.isValid);
  
  // Test 2: URL non-Supabase (fallback)
  console.log('\n📸 Test 2: URL non-Supabase (fallback)');
  const externalUrl = 'https://example.com/image.jpg';
  
  console.log('URL testée:', externalUrl);
  console.log('isSupabaseImageUrl:', isSupabaseImageUrl(externalUrl));
  
  const generatedSrc2 = generateImageSrc(externalUrl, 1042);
  console.log('generateImageSrc:', generatedSrc2);
  console.log('✅ URLs identiques:', externalUrl === generatedSrc2);
  
  const altText2 = generateAltTextFromUrl(externalUrl, 'Image externe');
  console.log('generateAltTextFromUrl:', altText2);
  
  const validation2 = validateImage(externalUrl, altText2, 2);
  console.log('validateImage:', validation2);
  console.log('⚠️ Image non optimisée (attendu):', !validation2.isValid);
  
  // Test 3: URL Supabase non-optimisée (sans WebP)
  console.log('\n📸 Test 3: URL Supabase non-optimisée');
  const nonOptimizedUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/image.png';
  
  console.log('URL testée:', nonOptimizedUrl);
  const validation3 = validateImage(nonOptimizedUrl, 'Image PNG', 3);
  console.log('validateImage:', validation3);
  console.log('⚠️ Image non optimisée (attendu):', !validation3.isValid);
  console.log('Problèmes détectés:', validation3.issues);
  
  // Test 4: URL Supabase avec mauvais bucket
  console.log('\n📸 Test 4: URL Supabase avec mauvais bucket');
  const wrongBucketUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/wrong-bucket/1042/image.webp';
  
  console.log('URL testée:', wrongBucketUrl);
  const validation4 = validateImage(wrongBucketUrl, 'Image mauvais bucket', 4);
  console.log('validateImage:', validation4);
  console.log('⚠️ Image avec mauvais bucket (attendu):', !validation4.isValid);
  console.log('Problèmes détectés:', validation4.issues);
  
  console.log('\n✅ Tests des corrections d\'optimisation terminés');
  console.log('================================================');
}

// Test de performance des URLs
export function testImageUrlPerformance() {
  console.log('⚡ Test de performance des URLs d\'images');
  console.log('========================================');
  
  const testUrls = [
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/jardin-fleurs-printemps.webp',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/arbres-automne-couleurs.webp'
  ];
  
  const startTime = performance.now();
  
  testUrls.forEach((url, index) => {
    const src = generateImageSrc(url, 1042);
    const alt = generateAltTextFromUrl(url, `Test image ${index + 1}`);
    const validation = validateImage(url, alt, index + 1);
    
    console.log(`Image ${index + 1}:`, {
      originalUrl: url,
      generatedSrc: src,
      altText: alt,
      isValid: validation.isValid,
      isOptimized: validation.details.isWebpFormat && validation.details.isSupabaseUrl
    });
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`\n⚡ Performance: ${duration.toFixed(2)}ms pour ${testUrls.length} images`);
  console.log('========================================');
}

// Fonction principale de test
export function runImageOptimizationTests() {
  console.log('🚀 Démarrage des tests d\'optimisation des images');
  console.log('================================================');
  
  testImageOptimizationFix();
  testImageUrlPerformance();
  
  console.log('================================================');
  console.log('✅ Tous les tests d\'optimisation terminés');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runImageOptimizationTests()');
}

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined') {
  console.log('🔧 Script de test d\'optimisation des images chargé');
  console.log('Exécutez runImageOptimizationTests() pour commencer les tests');
}
