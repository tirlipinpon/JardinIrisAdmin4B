/**
 * Utilitaire de test pour valider les regex d'injection d'images
 * avec des structures HTML complexes
 */

export function testComplexHtmlRegex() {
  console.log('🧪 Test des regex pour structures HTML complexes');
  
  // Test 1: Structure simple
  const simpleHtml = `
    <span id="paragraphe-1">
      <h4>Chapitre simple</h4>
      <ul><li>Point 1</li><li>Point 2</li></ul>
      <p>Contenu</p>
    </span>
  `;
  
  // Test 2: Structure avec liens et tooltips dans h4
  const complexH4Html = `
    <span id="paragraphe-1">
      <h4>Comment ancrer solidement un jeune <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/abattre-arbre-bruxelles-permis-jardinier.html" title="Abattre un arbre à Bruxelles : ce que qu il faut savoir sur les permis d'urbanisme ?">arbre à Bruxelles<span class="myTooltiptext">Abattre un arbre à Bruxelles : ce que qu il faut savoir sur les permis d'urbanisme ?</span></a> ?</h4>
      <ul>Les 4 premières années : période cruciale pour l'enracinement</ul>
    </span>
  `;
  
  // Test 3: Structure avec liens et tooltips dans ul
  const complexUlHtml = `
    <span id="paragraphe-2">
      <h4>Comment protéger abris et structures des tempêtes bruxelloises ?</h4>
      <ul>La dalle béton et les câbles d'acier : votre assurance <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/assurance-jardin-bruxelles-couverture-intemperies.html" title="Votre jardin à Bruxelles est-il bien assuré contre les intempéries ?">intempéries<span class="myTooltiptext">Votre jardin à Bruxelles est-il bien assuré contre les intempéries ?</span></a></ul>
    </span>
  `;
  
  // Test 4: Structure mixte complexe
  const mixedComplexHtml = `
    <span id="paragraphe-3">
      <h4>Gestion des <a href="#test">espaces verts</a> en <strong>milieu urbain</strong></h4>
      <ul>
        <li>Point avec <a class="tooltip" href="#link1">lien interne</a></li>
        <li>Point avec <em>texte en italique</em></li>
        <li>Point normal</li>
      </ul>
      <p>Paragraphe avec <span class="highlight">texte surligné</span></p>
    </span>
  `;
  
  // Regex améliorée pour les spans
  const paragraphRegex = /<span\s+id=(?:["'])paragraphe-(\d+)(?:["'])\s*>(.*?)<\/span>/gs;
  
  // Test de la regex sur chaque structure
  const testCases = [
    { name: 'Structure simple', html: simpleHtml },
    { name: 'Structure complexe H4', html: complexH4Html },
    { name: 'Structure complexe UL', html: complexUlHtml },
    { name: 'Structure mixte complexe', html: mixedComplexHtml }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    
    let match;
    const matches = [];
    const regex = new RegExp(paragraphRegex);
    
    while ((match = regex.exec(testCase.html)) !== null) {
      matches.push({
        paragraphId: match[1],
        content: match[2],
        fullMatch: match[0]
      });
    }
    
    console.log(`✅ Nombre de spans trouvés: ${matches.length}`);
    
    matches.forEach(match => {
      console.log(`  📄 Paragraphe ${match.paragraphId}:`);
      console.log(`    - Longueur du contenu: ${match.content.length} caractères`);
      console.log(`    - Contient <h4>: ${match.content.includes('<h4')}`);
      console.log(`    - Contient <ul>: ${match.content.includes('<ul')}`);
      console.log(`    - Contient </ul>: ${match.content.includes('</ul>')}`);
      console.log(`    - Contient des liens: ${match.content.includes('<a')}`);
      console.log(`    - Contient des tooltips: ${match.content.includes('myTooltip')}`);
      
      // Test de la recherche de </ul>
      const ulEndPattern = /<\/ul>/i;
      const ulMatch = match.content.match(ulEndPattern);
      console.log(`    - </ul> trouvé: ${!!ulMatch}`);
      
      if (ulMatch) {
        const ulIndex = match.content.indexOf(ulMatch[0]);
        const beforeUl = match.content.substring(0, ulIndex + ulMatch[0].length);
        const afterUl = match.content.substring(ulIndex + ulMatch[0].length);
        console.log(`    - Avant </ul>: ${beforeUl.length} caractères`);
        console.log(`    - Après </ul>: ${afterUl.length} caractères`);
      }
    });
  });
  
  console.log('\n✅ Tests des regex terminés');
  return true;
}

/**
 * Test spécifique pour les structures HTML mentionnées par l'utilisateur
 */
export function testUserProvidedStructures() {
  console.log('🧪 Test des structures HTML spécifiques de l\'utilisateur');
  
  const userHtml1 = `<span id="paragraphe-1"><h4>Comment ancrer solidement un jeune <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/abattre-arbre-bruxelles-permis-jardinier.html" title="Abattre un arbre à Bruxelles : ce que qu il faut savoir sur les permis d'urbanisme ?">arbre à Bruxelles<span class="myTooltiptext">Abattre un arbre à Bruxelles : ce que qu il faut savoir sur les permis d'urbanisme ?</span></a> ?</h4><ul>Les 4 premières années : période cruciale pour l'enracinement</ul></span>`;
  
  const userHtml2 = `<span id="paragraphe-2"><h4>Comment protéger abris et structures des tempêtes bruxelloises ?</h4><ul>La dalle béton et les câbles d'acier : votre assurance <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/assurance-jardin-bruxelles-couverture-intemperies.html" title="Votre jardin à Bruxelles est-il bien assuré contre les intempéries ?">intempéries<span class="myTooltiptext">Votre jardin à Bruxelles est-il bien assuré contre les intempéries ?</span></a></ul></span>`;
  
  const paragraphRegex = /<span\s+id=(?:["'])paragraphe-(\d+)(?:["'])\s*>(.*?)<\/span>/gs;
  
  [userHtml1, userHtml2].forEach((html, index) => {
    console.log(`\n📋 Test structure utilisateur ${index + 1}:`);
    
    const match = paragraphRegex.exec(html);
    if (match) {
      const [, paragraphId, content] = match;
      console.log(`✅ Paragraphe ${paragraphId} trouvé`);
      console.log(`  - Longueur: ${content.length} caractères`);
      console.log(`  - Contient </ul>: ${content.includes('</ul>')}`);
      
      // Test de l'injection d'image
      const ulEndPattern = /<\/ul>/i;
      const ulMatch = content.match(ulEndPattern);
      if (ulMatch) {
        const ulIndex = content.indexOf(ulMatch[0]);
        const beforeUl = content.substring(0, ulIndex + ulMatch[0].length);
        const afterUl = content.substring(ulIndex + ulMatch[0].length);
        
        const imgTag = '<img src="test.jpg" alt="test" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;">';
        const newContent = beforeUl + imgTag + afterUl;
        
        console.log(`  ✅ Injection d'image simulée réussie`);
        console.log(`  - Nouveau contenu: ${newContent.length} caractères`);
        console.log(`  - Image injectée: ${newContent.includes('randomCropImage')}`);
      } else {
        console.log(`  ❌ Aucun </ul> trouvé pour l'injection`);
      }
    } else {
      console.log(`❌ Aucun paragraphe trouvé`);
    }
  });
  
  console.log('\n✅ Tests des structures utilisateur terminés');
  return true;
}

/**
 * Fonction principale de test
 */
export function runAllRegexTests() {
  console.log('🚀 Démarrage des tests de regex pour structures HTML complexes');
  console.log('============================================================');
  
  testComplexHtmlRegex();
  testUserProvidedStructures();
  
  console.log('============================================================');
  console.log('✅ Tous les tests de regex terminés');
  console.log('');
  console.log('📋 Pour utiliser ces tests dans la console:');
  console.log('1. Ouvrez la console du navigateur (F12)');
  console.log('2. Importez ce fichier ou copiez les fonctions');
  console.log('3. Exécutez: runAllRegexTests()');
}
