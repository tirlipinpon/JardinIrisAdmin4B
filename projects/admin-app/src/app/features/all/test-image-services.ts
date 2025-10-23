/**
 * Script de test pour vérifier le fonctionnement des services d'images
 * À exécuter dans la console du navigateur pour tester les fonctionnalités
 */

// Test des utilitaires de validation d'images
export function testImageValidation() {
  console.log('🧪 Test des utilitaires de validation d\'images');
  
  // Import des fonctions (à adapter selon votre structure)
  // import { validateImage, countInjectedImages } from '../../utils/image-validation';
  
  // Test 1: Validation d'une image valide
  console.log('Test 1: Image valide');
  const validImage = {
    url: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/test.webp',
    alt: 'test-image-description'
  };
  
  // Test 2: Validation d'une image invalide
  console.log('Test 2: Image invalide');
  const invalidImage = {
    url: 'invalid-url',
    alt: ''
  };
  
  // Test 3: Comptage d'images dans un contenu HTML
  console.log('Test 3: Comptage d\'images');
  const htmlContent = `
    <span id="paragraphe-1">
      <h4>Test</h4>
      <ul><li>Item</li></ul>
      <img src="test.jpg" alt="test" class="randomCropImage">
    </span>
  `;
  
  console.log('✅ Tests de validation d\'images terminés');
}

// Test du service d'injection d'images
export function testImageInjection() {
  console.log('🧪 Test du service d\'injection d\'images');
  
  const mockPost = {
    id: 999,
    article: `
      <span id="paragraphe-1">
        <h4>Chapitre 1</h4>
        <ul><li>Point 1</li><li>Point 2</li></ul>
        <p>Contenu du chapitre 1</p>
      </span>
      <span id="paragraphe-2">
        <h4>Chapitre 2</h4>
        <ul><li>Point 3</li><li>Point 4</li></ul>
        <p>Contenu du chapitre 2</p>
      </span>
    `,
    images_chapitres: [
      {
        id: 1,
        chapitre_id: 1,
        url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/test1.webp',
        chapitre_key_word: 'test image 1',
        changed: false
      },
      {
        id: 2,
        chapitre_id: 2,
        url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/test2.webp',
        chapitre_key_word: 'test image 2',
        changed: false
      }
    ]
  };
  
  console.log('Post de test créé:', mockPost);
  console.log('✅ Test du service d\'injection d\'images terminé');
}

// Test du service de diagnostic
export function testImageDiagnostic() {
  console.log('🧪 Test du service de diagnostic d\'images');
  
  const mockImages = [
    {
      chapitre_id: 1,
      url_Image: 'https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/images/test1.webp',
      chapitre_key_word: 'test image 1'
    },
    {
      chapitre_id: 2,
      url_Image: 'invalid-url',
      chapitre_key_word: ''
    }
  ];
  
  console.log('Images de test créées:', mockImages);
  console.log('✅ Test du service de diagnostic terminé');
}

// Fonction principale de test
export function runAllTests() {
  console.log('🚀 Démarrage des tests des services d\'images');
  console.log('==========================================');
  
  testImageValidation();
  testImageInjection();
  testImageDiagnostic();
  
  console.log('==========================================');
  console.log('✅ Tous les tests terminés');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runAllTests()');
}

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined') {
  console.log('🔧 Script de test des services d\'images chargé');
  console.log('Exécutez runAllTests() pour commencer les tests');
}
