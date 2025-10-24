/**
 * Test pour vérifier le flux de validation des images
 * Ce fichier permet de tester et déboguer le problème des images non optimisées
 */

import { PostValidationService } from './services/post-validation/post-validation.service';
import { Post } from '../../types/post';

export function testImageValidationFlow() {
  console.log('🧪 [TEST] Début du test du flux de validation des images');
  
  // Créer un post de test avec des images non optimisées
  const testPost: Post = {
    id: 999,
    created_at: new Date().toISOString(),
    titre: 'Test Image Validation',
    description_meteo: 'Test météo',
    phrase_accroche: 'Test accroche',
    article: '<span id="paragraphe-1"><article>Contenu test</article></span>',
    citation: 'Test citation',
    lien_url_article: null,
    image_url: 'https://view.publitas.com/60225/1438257/pages/e05e6658-8d95-489f-a587-50f6826b9dfa-at1000.jpg',
    categorie: 'test',
    visite: 0,
    valid: false,
    deleted: false,
    video: null,
    new_href: 'test-image-validation',
    images_chapitres: [
      {
        id: 1,
        fk_post: 999,
        chapitre_id: 1,
        url_Image: 'https://view.publitas.com/60225/1438257/pages/e05e6658-8d95-489f-a587-50f6826b9dfa-at1000.jpg',
        chapitre_key_word: 'calendrier-plantation-bulbes',
        changed: true
      }
    ]
  };
  
  console.log('📝 [TEST] Post de test créé:', {
    id: testPost.id,
    image_url: testPost.image_url,
    images_chapitres_count: testPost.images_chapitres?.length || 0,
    first_image_url: testPost.images_chapitres?.[0]?.url_Image
  });
  
  // Tester la détection d'images externes
  console.log('🔍 [TEST] Test de détection d\'images externes:');
  
  // Simuler la logique de isExternalImage
  const isExternalImage = (imageUrl?: string): boolean => {
    if (!imageUrl) return false;
    
    const isExternal = !imageUrl.includes('zmgfaiprgbawcernymqa.supabase.co') &&
                      (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
    const isNotOptimized = !imageUrl.includes('.webp') || !imageUrl.includes('/jardin-iris-images-post/');
    
    console.log(`  - URL: ${imageUrl}`);
    console.log(`  - isExternal: ${isExternal}`);
    console.log(`  - isNotOptimized: ${isNotOptimized}`);
    console.log(`  - Résultat: ${isExternal || isNotOptimized}`);
    
    return isExternal || isNotOptimized;
  };
  
  // Tester l'image principale
  console.log('🖼️ [TEST] Test image principale:');
  const mainImageNeedsOptimization = isExternalImage(testPost.image_url);
  console.log(`  - Image principale nécessite optimisation: ${mainImageNeedsOptimization}`);
  
  // Tester les images de chapitres
  console.log('📸 [TEST] Test images de chapitres:');
  testPost.images_chapitres?.forEach((image, index) => {
    console.log(`  - Image chapitre ${index + 1}:`);
    const needsOptimization = !image.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
                             !image.url_Image?.includes('.webp') ||
                             !image.url_Image?.includes('/jardin-iris-images-post/');
    console.log(`    - URL: ${image.url_Image}`);
    console.log(`    - Nécessite optimisation: ${needsOptimization}`);
    console.log(`    - Marquée comme changée: ${image.changed}`);
  });
  
  // Tester la transformation d'URLs
  console.log('🔄 [TEST] Test transformation d\'URLs:');
  
  // Simuler la fonction generateImageSrc
  const generateImageSrc = (url: string, postId?: number): string => {
    // Vérifier si c'est une URL Supabase valide
    const supabasePattern = /zmgfaiprgbawcernymqa\.supabase\.co\/storage\/v1\/object\/public\/([^\/]+)\/(\d+)\/(.+)$/;
    const match = url.match(supabasePattern);
    
    if (match) {
      const [, bucket, postIdFromUrl, filename] = match;
      const jardinIrisUrl = `https://www.jardin-iris.be/image-blog/${postIdFromUrl}/${filename}`;
      console.log(`  - URL Supabase détectée: ${url}`);
      console.log(`  - Transformée vers: ${jardinIrisUrl}`);
      return jardinIrisUrl;
    }
    
    console.log(`  - URL non-Supabase, conservée: ${url}`);
    return url;
  };
  
  // Tester la transformation de l'image principale
  console.log('🖼️ [TEST] Transformation image principale:');
  const transformedMainImage = generateImageSrc(testPost.image_url, testPost.id);
  
  // Tester la transformation des images de chapitres
  console.log('📸 [TEST] Transformation images de chapitres:');
  testPost.images_chapitres?.forEach((image, index) => {
    console.log(`  - Image chapitre ${index + 1}:`);
    const transformedUrl = generateImageSrc(image.url_Image, testPost.id);
  });
  
  console.log('✅ [TEST] Test du flux de validation des images terminé');
  console.log('📊 [TEST] Résumé:');
  console.log(`  - Image principale nécessite optimisation: ${mainImageNeedsOptimization}`);
  console.log(`  - Images de chapitres nécessitant optimisation: ${testPost.images_chapitres?.filter(img => 
    !img.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
    !img.url_Image?.includes('.webp') ||
    !img.url_Image?.includes('/jardin-iris-images-post/')
  ).length || 0}`);
  
  return {
    post: testPost,
    mainImageNeedsOptimization,
    chapterImagesNeedOptimization: testPost.images_chapitres?.filter(img => 
      !img.url_Image?.includes('zmgfaiprgbawcernymqa.supabase.co') || 
      !img.url_Image?.includes('.webp') ||
      !img.url_Image?.includes('/jardin-iris-images-post/')
    ).length || 0
  };
}

// Fonction pour tester le flux complet de validation
export function testCompleteValidationFlow(postValidationService: PostValidationService, testPost: Post) {
  console.log('🚀 [TEST] Début du test du flux complet de validation');
  
  return postValidationService.validatePost(testPost.id!).subscribe({
    next: (result) => {
      console.log('✅ [TEST] Validation réussie:', result);
    },
    error: (error) => {
      console.error('❌ [TEST] Erreur de validation:', error);
    },
    complete: () => {
      console.log('🏁 [TEST] Test du flux complet terminé');
    }
  });
}
