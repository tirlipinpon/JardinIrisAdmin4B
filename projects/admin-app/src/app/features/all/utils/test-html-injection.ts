/**
 * Test de validation de l'injection d'images dans les spans imbriqués
 * Ce fichier teste la robustesse de la nouvelle regex
 */

export function testHtmlInjection() {
  console.log('🧪 Test de validation de l\'injection d\'images');
  
  // HTML de test avec spans imbriqués (similaire au problème rencontré)
  const testHtml = `
    <span id="paragraphe-1">
      <h4>Quels poivrons italiens choisir pour son potager bruxellois ?</h4>
      <ul>Variétés adaptées au climat belge capricieux</ul>
      <article>En tant que 
        <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/materiel-jardinage-bruxelles-2024.html" title="Quel matériel de jardinage choisir à Bruxelles en 2024 ?">
          jardinier à Bruxelles
          <span class="myTooltiptext">Quel matériel de jardinage choisir à Bruxelles en 2024 ?</span>
        </a>, j'ai testé plusieurs cultivars italiens dans les potagers urbains de la région.
        <em>
          <span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-1">
            Capsicum annuum
            <div class="inat-vegetal-tooltip">
              <img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum">
              <div class="taxon-name">Capsicum annuum</div>
            </div>
          </span>
        </em> de type ''Corno di Toro'' et ''Quadrato d'Asti'' donnent d'excellents résultats.
      </article>
    </span>
    
    <span id="paragraphe-2">
      <h4>Comment préparer le sol pour des poivrons italiens à Bruxelles ?</h4>
      <ul>Un terreau riche et drainant pour des fruits charnus</ul>
      <article>La réussite des poivrons italiens commence par une préparation minutieuse du sol.</article>
    </span>
  `;
  
  // Regex de test (celle utilisée dans le service)
  const paragraphRegex = /<span\s+id=(?:["'])paragraphe-(\d+)(?:["'])\s*>(?:(?!<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>).)*?<\/span>/gs;
  
  console.log('📋 Test de la regex sur le HTML de test...');
  
  let match;
  let matchCount = 0;
  const results = [];
  
  while ((match = paragraphRegex.exec(testHtml)) !== null) {
    matchCount++;
    const paragraphId = parseInt(match[1]);
    const fullMatch = match[0];
    
    // Extraire le contenu du span
    const contentMatch = fullMatch.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>(.*?)<\/span>/s);
    const content = contentMatch ? contentMatch[1] : '';
    
    results.push({
      paragraphId,
      contentLength: content.length,
      hasH4: content.includes('<h4'),
      hasUl: content.includes('<ul'),
      hasArticle: content.includes('<article'),
      hasNestedSpans: content.includes('<span class="'),
      contentPreview: content.substring(0, 100) + '...'
    });
    
    console.log(`✅ Span ${paragraphId} trouvé:`, {
      contentLength: content.length,
      hasH4: content.includes('<h4'),
      hasUl: content.includes('<ul'),
      hasArticle: content.includes('<article'),
      hasNestedSpans: content.includes('<span class="')
    });
  }
  
  console.log(`📊 Résultats du test:`, {
    totalMatches: matchCount,
    expectedMatches: 2,
    testPassed: matchCount === 2,
    results
  });
  
  // Test de simulation d'injection d'image
  console.log('\n🖼️ Test de simulation d\'injection d\'image...');
  
  const simulatedImageTag = '<img src="https://www.jardin-iris.be/image-blog/1044/test-image.webp" alt="test" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async">';
  
  const modifiedHtml = testHtml.replace(paragraphRegex, (match, paragraphNumber) => {
    const paragraphId = parseInt(paragraphNumber);
    const contentMatch = match.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>(.*?)<\/span>/s);
    
    if (!contentMatch) return match;
    
    const content = contentMatch[1];
    const articlePattern = /<article>/i;
    const articleMatch = content.match(articlePattern);
    
    let newContent: string;
    
    if (articleMatch) {
      // Injecter avant <article>
      const articleIndex = content.indexOf(articleMatch[0]);
      const beforeArticle = content.substring(0, articleIndex);
      const afterArticle = content.substring(articleIndex);
      newContent = beforeArticle + simulatedImageTag + afterArticle;
    } else {
      // Injecter à la fin
      newContent = content + simulatedImageTag;
    }
    
    return `<span id="paragraphe-${paragraphId}">${newContent}</span>`;
  });
  
  console.log('✅ HTML modifié avec succès');
  console.log('📏 Longueur originale:', testHtml.length);
  console.log('📏 Longueur modifiée:', modifiedHtml.length);
  console.log('🖼️ Images injectées:', (modifiedHtml.match(/class="randomCropImage"/g) || []).length);
  
  // Vérifier que la structure HTML est préservée
  const originalSpans = (testHtml.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>/g) || []).length;
  const modifiedSpans = (modifiedHtml.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>/g) || []).length;
  
  console.log('🔍 Vérification de la structure HTML:');
  console.log('- Spans originaux:', originalSpans);
  console.log('- Spans modifiés:', modifiedSpans);
  console.log('- Structure préservée:', originalSpans === modifiedSpans);
  
  return {
    testPassed: matchCount === 2 && originalSpans === modifiedSpans,
    matchCount,
    originalSpans,
    modifiedSpans,
    results
  };
}

// Fonction pour tester avec le HTML problématique fourni par l'utilisateur
export function testProblematicHtml() {
  console.log('🚨 Test avec le HTML problématique fourni par l\'utilisateur');
  
  const problematicHtml = `<span id="paragraphe-1"><h4>Quels poivrons italiens choisir pour son potager bruxellois ?</h4><ul>Variétés adaptées au climat belge capricieux</ul><img src="https://www.jardin-iris.be/image-blog/1044/poivrons-multicolores-recolte-legumes-jardin-potag.webp" alt="peppers" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async"><article>En tant que <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/materiel-jardinage-bruxelles-2024.html" title="Quel matériel de jardinage choisir à Bruxelles en 2024 ?">jardinier à Bruxelles<span class="myTooltiptext">Quel matériel de jardinage choisir à Bruxelles en 2024 ?</span></a>, j'ai testé plusieurs cultivars italiens dans les potagers urbains de la région. <u>Le secret réside dans le choix des variétés</u> qui supportent nos étés parfois frais et humides. Les <em><span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-1">Capsicum annuum<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span></em> de type ''<span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-2">Corno di Toro<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span>' et ''<span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-3">Quadrato d'Asti<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span>' donnent d'excellents résultats. Je me souviens d'un client à Uccle qui désespérait avec ses poivrons - après avoir opté pour ''<span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-4">Lungo Marconi<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span>', sa récolte a triplé ! <ul><li><b><span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-5">Cornetto di Carmagnola<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span></b> : précoce, idéal pour saisons courtes</li><li><b><span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-6">Tumaticot<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/583512431/large.jpg" alt="Capsicum annuum"><div class="taxon-name">Capsicum annuum</div></div></span></b> : résistant aux maladies fongiques</li><li><b><span class="inat-vegetal" data-taxon-name="Capsicum annuum" data-paragraphe-id="0-7">Friariello<di<span id="paragraphe-2"><h4>Comment préparer le sol pour des poivrons italiens à Bruxelles ?</h4><ul>Un terreau riche et drainant pour des fruits charnus</ul><img src="https://www.jardin-iris.be/image-blog/1044/terre-jardinage-pelle-plantation-fleurs-jardin-pri.webp" alt="soil" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async"><article>La réussite des poivrons italiens commence par <b>une préparation minutieuse du sol</b>. Dans nos jardins bruxellois, l'argile lourde peut poser problème. J'ai développé une technique infaillible : <u>mélangez 40% de terreau spécial potager, 30% de compost bien décomposé et 30% de sable de rivière</u>. L'anecdote qui m'a marqué : un jardinier d'Ixelles qui ajoutait systématiquement du fumier de cheval frais - résultat, ses plants brûlaient ! <em>pH idéal entre 6.0 et 6<span id="paragraphe-3"><h4>Quand et comment planter les poivrons italiens à Bruxelles ?</h4><ul>Calendrier de plantation adapté au microclimat urbain</ul><img src="https://www.jardin-iris.be/image-blog/1044/jeunes-plants-legumes-arrosage-goutte-a-goutte-jardin.webp" alt="jeunes-plants-legumes-arrosage-goutte-a-goutte-jardin" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async"><article>Le timing est <b>essentiel pour le <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/jardinier-bruxelles-preparation-hiver-protection-gel.html" title="Comment préparer son jardin bruxellois pour affronter l'hiver ?">jardinier à Bruxelles<span class="myTooltiptext">Comment préparer son jardin bruxellois pour affronter l'hiver ?</span></a></b> qui veut réussir ses poivrons. Attendez impérativement <u>la mi-mai après les Saints de Glace</u>. J'ai personnellement perdu une plantation entière en avril à cause d'une gelée tardive surprise. Technique éprouvée : <em>acclimatation progressive des plants</em> p<span id="paragraphe-4"><h4>Comment entretenir ses poivrons italiens pendant l'été bruxellois ?</h4><ul>Arrosage et fertilisation pour une récolte abondante</ul><img src="https://www.jardin-iris.be/image-blog/1044/palmiers-soleil-ciel-bleu-paysage-tropical-jardin.webp" alt="summer" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async"><article>L'<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/entretien-terrasse-bois-bruxelles-erreurs-eviter.html" title="Comment entretenir sa terrasse en bois à Bruxelles sans faire d'erreurs ?">entretien<span class="myTooltiptext">Comment entretenir sa terrasse en bois à Bruxelles sans faire d'erreurs ?</span></a> des poivrons italiens demande <b>une attention particulière durant nos étés variables. J'ai remarqué que l'erreur la plus fréquente chez les jardiniers bruxellois est <em>l'excès d'arrosage</em>. Technique : arrosez abondamment mais moins fréquemment, en visant les racines. Fertilisation : appor<span id="paragraphe-5"><h4>Quand récolter et comment conserver les poivrons italiens ?</h4><ul>De la cueillette à la conservation optimale</ul><img src="https://www.jardin-iris.be/image-blog/1044/champs-ble-tiges-vertes-graine-mature-jardinage.webp" alt="harvest" class="randomCropImage" style="width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;" loading="lazy" decoding="async"><article>La récolte des poivrons italiens commence généralement <b>de juillet à octobre selon les variétés</b>. Signe distinctif : les fruits doivent être fermes et avoir atteint leur couleur définitive. Pour les 'Corno di Toro', attendez le rouge vif. Conservation : <ul><li>Au réfrigérateur : 2 semaines</li><li>Séchage : coupez en lanières</li><li>Congélation : blanchis 3 minutes</li></ul> Mon conseil de <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/jardinier-bruxelles-eclairage-exterieur-conseils.html" title="Comment éclairer son jardin à Bruxelles comme un pro ?">jardinier à Bruxelles<span class="myTooltiptext">Comment éclairer son jardin à Bruxelles comme un pro ?</span></a> : récoltez régulièrement pour stimuler la production. Les derniers fruits peuvent être cueillis avant les premières gelées et mûris en intérieur.</article></span>ontes de gazon sèches pour maintenir l'humidité. Surveillez particulièrement l'oïdium en période humide. Rotation des cultures indispensable pour éviter les maladies.</b></article></span><b><span id="paragraphe-5"><h4>Quand récolter et comment conserver les poivrons italiens ?</h4><ul>De la cueillette à la conservation optimale</ul><article>La récolte des poivrons italiens commence généralement <b>de juillet à octobre selon les variétés</b>. Signe distinctif : les fruits doivent être fermes et avoir atteint leur couleur définitive. Pour les 'Corno di Toro', attendez le rouge vif. Conservation : <ul><li>Au réfrigérateur : 2 semaines</li><li>Séchage : coupez en lanières</li><li>Congélation : blanchis 3 minutes</li></ul> Mon conseil de <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/jardinier-bruxelles-eclairage-exterieur-conseils.html" title="Comment éclairer son jardin à Bruxelles comme un pro ?">jardinier à Bruxelles<span class="myTooltiptext">Comment éclairer son jardin à Bruxelles comme un pro ?</span></a> : récoltez régulièrement pour stimuler la production. Les derniers fruits peuvent être cueillis avant les premières gelées et mûris en intérieur.</article></span> <!--  //TODO: remplacer avec article -->`;
  
  console.log('⚠️ HTML problématique détecté - structure cassée');
  console.log('📏 Longueur du HTML:', problematicHtml.length);
  
  // Compter les spans paragraphe-X
  const paragraphSpans = (problematicHtml.match(/<span\s+id=(?:["'])paragraphe-\d+(?:["'])\s*>/g) || []).length;
  console.log('📊 Spans paragraphe-X trouvés:', paragraphSpans);
  
  // Compter les spans de fermeture
  const closingSpans = (problematicHtml.match(/<\/span>/g) || []).length;
  console.log('📊 Spans de fermeture trouvés:', closingSpans);
  
  // Vérifier l'équilibre
  const isBalanced = paragraphSpans === closingSpans;
  console.log('⚖️ Structure équilibrée:', isBalanced);
  
  if (!isBalanced) {
    console.log('🚨 PROBLÈME DÉTECTÉ: Structure HTML déséquilibrée');
    console.log('   - Spans ouverts:', paragraphSpans);
    console.log('   - Spans fermés:', closingSpans);
    console.log('   - Différence:', Math.abs(paragraphSpans - closingSpans));
  }
  
  return {
    isBalanced,
    paragraphSpans,
    closingSpans,
    difference: Math.abs(paragraphSpans - closingSpans)
  };
}

// Fonction principale de test
export function runAllHtmlInjectionTests() {
  console.log('🚀 Démarrage des tests d\'injection HTML');
  console.log('='.repeat(50));
  
  const test1 = testHtmlInjection();
  console.log('\n' + '='.repeat(50));
  const test2 = testProblematicHtml();
  
  console.log('\n📋 Résumé des tests:');
  console.log('✅ Test HTML normal:', test1.testPassed ? 'PASSÉ' : 'ÉCHOUÉ');
  console.log('⚠️ Test HTML problématique:', test2.isBalanced ? 'STRUCTURE OK' : 'STRUCTURE CASSÉE');
  
  return {
    normalTest: test1,
    problematicTest: test2,
    allTestsPassed: test1.testPassed && test2.isBalanced
  };
}
