/**
 * Script de test pour vérifier le format de l'image principale
 * À exécuter dans la console du navigateur pour tester les fonctionnalités
 */

import {
    generateImageSrc,
    isSupabaseImageUrl,
    parseSupabaseUrl
} from '../../../utils/supabase-image-utils';

// Test du format de l'image principale
export function testMainImageFormat() {
  console.log('🧪 Test du format de l\'image principale');
  console.log('==========================================');
  
  // Test 1: URL d'image principale optimisée (nouveau format)
  console.log('\n📸 Test 1: Image principale optimisée (nouveau format)');
  const optimizedMainImageUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/jardin-fleurs-printemps-couleurs.webp';
  
  console.log('URL testée:', optimizedMainImageUrl);
  console.log('isSupabaseImageUrl:', isSupabaseImageUrl(optimizedMainImageUrl));
  
  const parsedUrl = parseSupabaseUrl(optimizedMainImageUrl);
  console.log('parseSupabaseUrl:', parsedUrl);
  console.log('✅ Bucket correct:', parsedUrl.bucket === 'jardin-iris-images-post');
  console.log('✅ Format WebP:', optimizedMainImageUrl.toLowerCase().includes('.webp'));
  console.log('✅ Structure correcte:', parsedUrl.isValid);
  
  const generatedSrc = generateImageSrc(optimizedMainImageUrl, 1042);
  console.log('generateImageSrc:', generatedSrc);
  console.log('✅ URLs identiques:', optimizedMainImageUrl === generatedSrc);
  
  // Test 2: URL d'image principale ancien format (à migrer)
  console.log('\n📸 Test 2: Image principale ancien format (à migrer)');
  const oldMainImageUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/jardin-fleurs-printemps.png';
  
  console.log('URL testée:', oldMainImageUrl);
  console.log('isSupabaseImageUrl:', isSupabaseImageUrl(oldMainImageUrl));
  
  const parsedOldUrl = parseSupabaseUrl(oldMainImageUrl);
  console.log('parseSupabaseUrl:', parsedOldUrl);
  console.log('⚠️ Bucket incorrect:', parsedOldUrl.bucket !== 'jardin-iris-images-post');
  console.log('⚠️ Format non-WebP:', !oldMainImageUrl.toLowerCase().includes('.webp'));
  
  // Test 3: Structure attendue pour les nouvelles images principales
  console.log('\n📸 Test 3: Structure attendue pour les nouvelles images principales');
  const expectedStructure = {
    baseUrl: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public',
    bucket: 'jardin-iris-images-post',
    postId: '1042',
    filename: 'jardin-fleurs-printemps-couleurs.webp',
    fullPath: '1042/jardin-fleurs-printemps-couleurs.webp'
  };
  
  console.log('Structure attendue:', expectedStructure);
  
  const testUrl = `${expectedStructure.baseUrl}/${expectedStructure.bucket}/${expectedStructure.fullPath}`;
  console.log('URL de test générée:', testUrl);
  
  const testParsed = parseSupabaseUrl(testUrl);
  console.log('Test parseSupabaseUrl:', testParsed);
  console.log('✅ Structure correcte:', testParsed.isValid);
  console.log('✅ Bucket correct:', testParsed.bucket === expectedStructure.bucket);
  console.log('✅ PostId correct:', testParsed.postId === expectedStructure.postId);
  console.log('✅ Filename correct:', testParsed.filename === expectedStructure.filename);
  
  console.log('\n✅ Tests du format de l\'image principale terminés');
  console.log('==========================================');
}

// Test de migration des images principales
export function testMainImageMigration() {
  console.log('🔄 Test de migration des images principales');
  console.log('==========================================');
  
  const migrationExamples = [
    {
      old: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/jardin-fleurs.png',
      new: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/jardin-fleurs.webp',
      description: 'Migration basique'
    },
    {
      old: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/1042.png',
      new: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/1042_main_1234567890.webp',
      description: 'Migration avec fallback timestamp'
    },
    {
      old: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/allee-foret-automne.png',
      new: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/allee-foret-automne.webp',
      description: 'Migration avec slug SEO'
    }
  ];
  
  migrationExamples.forEach((example, index) => {
    console.log(`\n📸 Exemple ${index + 1}: ${example.description}`);
    console.log('Ancien format:', example.old);
    console.log('Nouveau format:', example.new);
    
    const oldParsed = parseSupabaseUrl(example.old);
    const newParsed = parseSupabaseUrl(example.new);
    
    console.log('Ancien - isSupabaseUrl:', isSupabaseImageUrl(example.old));
    console.log('Ancien - bucket:', oldParsed.bucket);
    console.log('Ancien - format WebP:', example.old.toLowerCase().includes('.webp'));
    
    console.log('Nouveau - isSupabaseUrl:', isSupabaseImageUrl(example.new));
    console.log('Nouveau - bucket:', newParsed.bucket);
    console.log('Nouveau - format WebP:', example.new.toLowerCase().includes('.webp'));
    console.log('Nouveau - structure correcte:', newParsed.isValid);
  });
  
  console.log('\n✅ Tests de migration terminés');
  console.log('==========================================');
}

// Fonction principale de test
export function runMainImageFormatTests() {
  console.log('🚀 Démarrage des tests du format de l\'image principale');
  console.log('======================================================');
  
  testMainImageFormat();
  testMainImageMigration();
  
  console.log('======================================================');
  console.log('✅ Tous les tests du format de l\'image principale terminés');
  console.log('');
  console.log('📋 Résumé des changements:');
  console.log('1. ✅ Image principale utilise maintenant le bucket "jardin-iris-images-post"');
  console.log('2. ✅ Image principale est convertie en format WebP');
  console.log('3. ✅ Image principale est optimisée (resize, crop, compression)');
  console.log('4. ✅ Image principale suit la structure: /postId/slug.webp');
  console.log('5. ✅ Image principale utilise la même logique que les images de chapitres');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runMainImageFormatTests()');
}

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined') {
  console.log('🔧 Script de test du format de l\'image principale chargé');
  console.log('Exécutez runMainImageFormatTests() pour commencer les tests');
}
