import { SupabaseService } from '../shared/supabase/supabase.service';
import { inject } from '@angular/core';

/**
 * Utilitaire pour tester manuellement l'upload d'images problématiques
 * Utilisez cette fonction pour diagnostiquer pourquoi certaines images échouent
 */
export async function testImageUpload(imageUrl: string, postId: number = 1033, chapitreId: number = 1): Promise<void> {
  const supabaseService = inject(SupabaseService);
  
  console.log(`🧪 [TEST] Début du test d'upload pour l'image: ${imageUrl}`);
  console.log(`🧪 [TEST] PostId: ${postId}, ChapitreId: ${chapitreId}`);
  
  try {
    // Test 1: Vérifier si l'URL est accessible
    console.log(`🧪 [TEST] Étape 1: Test de l'accessibilité de l'URL...`);
    const testResponse = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log(`🧪 [TEST] ✓ URL accessible - Status: ${testResponse.status}, Content-Type: ${testResponse.headers.get('content-type')}`);
    
    // Test 2: Télécharger l'image
    console.log(`🧪 [TEST] Étape 2: Téléchargement de l'image...`);
    const imageResponse = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Échec du téléchargement: ${imageResponse.statusText} (${imageResponse.status})`);
    }
    
    const blob = await imageResponse.blob();
    console.log(`🧪 [TEST] ✓ Image téléchargée - Taille: ${(blob.size / 1024).toFixed(2)} Ko, Type: ${blob.type}`);
    
    // Test 3: Vérifier le type MIME
    if (!blob.type.startsWith('image/')) {
      console.warn(`🧪 [TEST] ⚠ Type MIME suspect: ${blob.type}`);
    }
    
    // Test 4: Upload via SupabaseService
    console.log(`🧪 [TEST] Étape 3: Upload via SupabaseService...`);
    const result = await supabaseService.uploadImageChapitreFromUrl(postId, chapitreId, imageUrl);
    
    if (result) {
      console.log(`🧪 [TEST] ✅ SUCCÈS - URL finale: ${result}`);
    } else {
      console.error(`🧪 [TEST] ❌ ÉCHEC - uploadImageChapitreFromUrl a retourné null`);
    }
    
  } catch (error) {
    console.error(`🧪 [TEST] ❌ ERREUR lors du test:`, error);
  }
}

/**
 * Teste toutes les images problématiques identifiées
 */
export async function testAllProblematicImages(): Promise<void> {
  const problematicImages = [
    {
      url: 'https://www.andenne.be/new22/wp-content/uploads/2022/09/Urbanisme-permis-durbanisme-annonce-enquete.jpg',
      postId: 1033,
      chapitreId: 1,
      description: 'Image permis urbanisme'
    },
    {
      url: 'https://www.elagage-hevea.com/static/version1759911549/frontend/Pixel/hevea/en_US/images/en_US/universe/bloc-arboristes-mobile.jpg',
      postId: 1033,
      chapitreId: 5,
      description: 'Image élagage'
    }
  ];
  
  console.log(`🧪 [TEST] Début des tests pour ${problematicImages.length} images problématiques`);
  
  for (const image of problematicImages) {
    console.log(`🧪 [TEST] === Test de l'image: ${image.description} ===`);
    await testImageUpload(image.url, image.postId, image.chapitreId);
    console.log(`🧪 [TEST] === Fin du test pour ${image.description} ===\n`);
    
    // Attendre 2 secondes entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`🧪 [TEST] ✅ Tous les tests terminés`);
}
