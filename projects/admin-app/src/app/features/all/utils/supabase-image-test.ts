/**
 * Tests pour les utilitaires Supabase Image
 */

import {
    extractSlugFromSupabaseUrl,
    generateAltTextFromUrl,
    generateImageSrc,
    isSupabaseImageUrl,
    parseSupabaseUrl
} from '../../../utils/supabase-image-utils';

export function testSupabaseImageUtils() {
  console.log('🧪 Test des utilitaires Supabase Image');
  
  // URL de test basée sur l'exemple fourni
  const testUrl = 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp';
  
  console.log('\n📋 Test 1: URL Supabase complète');
  console.log('URL:', testUrl);
  
  // Test d'extraction du slug
  const slug = extractSlugFromSupabaseUrl(testUrl);
  console.log('✅ Slug extrait:', slug);
  console.log('Attendu: allee-foret-automne-feuilles-couleurs-chaudes');
  console.log('Résultat:', slug === 'allee-foret-automne-feuilles-couleurs-chaudes' ? '✅ CORRECT' : '❌ INCORRECT');
  
  // Test de génération du src
  const src = generateImageSrc(testUrl, 1042);
  console.log('✅ Src généré:', src);
  console.log('Attendu: https://www.jardin-iris.be/image-blog/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp');
  console.log('Résultat:', src === 'https://www.jardin-iris.be/image-blog/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp' ? '✅ CORRECT' : '❌ INCORRECT');
  
  // Test de génération de l'alt text
  const altText = generateAltTextFromUrl(testUrl, 'Allée forêt automne feuilles couleurs chaudes');
  console.log('✅ Alt text généré:', altText);
  console.log('Attendu: allee-foret-automne-feuilles-couleurs-chaudes');
  console.log('Résultat:', altText === 'allee-foret-automne-feuilles-couleurs-chaudes' ? '✅ CORRECT' : '❌ INCORRECT');
  
  // Test de validation URL Supabase
  const isValidSupabase = isSupabaseImageUrl(testUrl);
  console.log('✅ URL Supabase valide:', isValidSupabase);
  console.log('Résultat:', isValidSupabase ? '✅ CORRECT' : '❌ INCORRECT');
  
  // Test de parsing de l'URL
  const urlInfo = parseSupabaseUrl(testUrl);
  console.log('✅ Informations URL:', urlInfo);
  console.log('Attendu: { isValid: true, bucket: "jardin-iris-images-post", postId: "1042", filename: "allee-foret-automne-feuilles-couleurs-chaudes.webp", slug: "allee-foret-automne-feuilles-couleurs-chaudes" }');
  
  const expectedInfo = {
    isValid: true,
    bucket: 'jardin-iris-images-post',
    postId: '1042',
    filename: 'allee-foret-automne-feuilles-couleurs-chaudes.webp',
    slug: 'allee-foret-automne-feuilles-couleurs-chaudes'
  };
  
  const isInfoCorrect = urlInfo.isValid === expectedInfo.isValid &&
                       urlInfo.bucket === expectedInfo.bucket &&
                       urlInfo.postId === expectedInfo.postId &&
                       urlInfo.filename === expectedInfo.filename &&
                       urlInfo.slug === expectedInfo.slug;
  
  console.log('Résultat:', isInfoCorrect ? '✅ CORRECT' : '❌ INCORRECT');
  
  console.log('\n📋 Test 2: URL non-Supabase');
  const nonSupabaseUrl = 'https://example.com/image.jpg';
  console.log('URL:', nonSupabaseUrl);
  
  const nonSupabaseSlug = extractSlugFromSupabaseUrl(nonSupabaseUrl);
  console.log('✅ Slug (fallback):', nonSupabaseSlug);
  console.log('Résultat:', nonSupabaseSlug === nonSupabaseUrl ? '✅ CORRECT' : '❌ INCORRECT');
  
  const nonSupabaseSrc = generateImageSrc(nonSupabaseUrl, 1042);
  console.log('✅ Src (fallback):', nonSupabaseSrc);
  console.log('Résultat:', nonSupabaseSrc === nonSupabaseUrl ? '✅ CORRECT' : '❌ INCORRECT');
  
  console.log('\n📋 Test 3: Génération d\'alt text avec key_word');
  const altWithKeyWord = generateAltTextFromUrl(testUrl, 'Allée forêt automne feuilles couleurs chaudes');
  console.log('✅ Alt text avec key_word:', altWithKeyWord);
  console.log('Attendu: allee-foret-automne-feuilles-couleurs-chaudes');
  console.log('Résultat:', altWithKeyWord === 'allee-foret-automne-feuilles-couleurs-chaudes' ? '✅ CORRECT' : '❌ INCORRECT');
  
  console.log('\n📋 Test 4: Génération d\'alt text sans key_word');
  const altWithoutKeyWord = generateAltTextFromUrl(testUrl);
  console.log('✅ Alt text sans key_word:', altWithoutKeyWord);
  console.log('Attendu: allee-foret-automne-feuilles-couleurs-chaudes');
  console.log('Résultat:', altWithoutKeyWord === 'allee-foret-automne-feuilles-couleurs-chaudes' ? '✅ CORRECT' : '❌ INCORRECT');
  
  console.log('\n📋 Test 5: Balise img complète');
  const imgTag = `<img src="${src}" alt="${altText}" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async">`;
  console.log('✅ Balise img générée:');
  console.log(imgTag);
  
  console.log('\n✅ Tous les tests des utilitaires Supabase Image terminés');
  return true;
}

export function testMultipleUrls() {
  console.log('🧪 Test avec plusieurs URLs Supabase');
  
  const testUrls = [
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1042/allee-foret-automne-feuilles-couleurs-chaudes.webp',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1043/jardin-fleurs-printemps-couleurs-vives.jpg',
    'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1044/arbre-majestueux-foret-verte.png',
    'https://example.com/external-image.jpg'
  ];
  
  testUrls.forEach((url, index) => {
    console.log(`\n📋 Test URL ${index + 1}:`);
    console.log('URL:', url);
    
    const slug = extractSlugFromSupabaseUrl(url);
    const src = generateImageSrc(url);
    const altText = generateAltTextFromUrl(url);
    const isValid = isSupabaseImageUrl(url);
    
    console.log('Slug:', slug);
    console.log('Src:', src);
    console.log('Alt:', altText);
    console.log('Valide Supabase:', isValid);
  });
  
  console.log('\n✅ Tests multiples terminés');
  return true;
}

export function runAllSupabaseImageTests() {
  console.log('🚀 Démarrage des tests des utilitaires Supabase Image');
  console.log('==================================================');
  
  testSupabaseImageUtils();
  testMultipleUrls();
  
  console.log('==================================================');
  console.log('✅ Tous les tests des utilitaires Supabase Image terminés');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runAllSupabaseImageTests()');
}
