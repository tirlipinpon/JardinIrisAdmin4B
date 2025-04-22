import { Injectable } from '@angular/core';
import {afficherCategories} from "../../../../utils/afficherCategories";
import {formatCurrentDateUs} from "../../../../utils/getFormattedDate";

@Injectable({
  providedIn: 'root'
})
export class GetPromptsService {

  // évaluer une liste d'articles provenant d'une API de news.
  // retourne un objet avec des instructions pour analyser chaque article selon des critères spécifiques liés au jardinage en Belgique.
  selectArticle(newsApiData: any): any {
    return {
      systemRole: {
        "role": "system",
        "content": `
        Analysez une liste d'articles pour déterminer s'il y a un article pertinent pour un blog.
Considérez si l'article est adapté à des amateurs ou professionnels et s'il est lié aux catégories ${afficherCategories(', ')}.
# Critères d'évaluation
- Vérifiez si l'article est pertinent pour des lecteurs amateurs ou professionnels selon ces catégories : ${afficherCategories(', ')}.
- Assurez-vous que le contenu est lié aux catégories spécifiées, directement ou indirectement.
# Instructions de Sortie
Si vous trouvez un article pertinent, retournez un objet JSON valide avec les champs suivants :
- \`"valid"\` : boolean - indique si l'article est pertinent.
- \`"explication"\` : objet avec raisons pourquoi chaque article est pertinent ou non pour le blog. Incluez une clé pour chaque article sous la forme \`"raison-article-1"\`, \`"raison-article-2"\`, etc.
  - Exemple: \`"raison-article-1": "Non pertinent car il parle de... ."\`, \`"raison-article-2": "Pertinent car il parle de... ."\`
- \`"url"\` : URL de l'article validé
- \`"image_url"\` : URL de l'image de l'article validé
Assurez-vous que chaque ligne du JSON est sur une ligne séparée sans aucun texte supplémentaire.
# Format de Sortie
Le résultat doit être un JSON strictement valide comme ceci:

{
    "valid": [true/false],
    "explication": {
        "raison-article-1": "[Explication pourquoi cet article est pertinent ou non pertinent]",
        "raison-article-2": "[Explication pourquoi cet article est pertinent ou non pertinent]",
        ...
    },
    "url": "[URL de l'article]",
    "image_url": "[URL de l'image de l'article]"
}

# Notes
- Analysez chaque article dans la liste fournie et justifiez pourquoi il est pertinent ou non.
- Ne retournez **qu'un seul objet JSON** correspondant à l'article pertinent si trouvé.
- Pour les articles jugés non pertinents, l'explication doit tout de même être fournie dans le champ \`explication\`.
- Aucune structuration ou texte supplémentaire n'est nécessaire en dehors du JSON.
        `},
      userRole: {
        "role": "user",
        "content": `Voici la liste des articles à évaluer : ${JSON.stringify(newsApiData)}.
      Tu dois retourner un objet JSON avec un seul article valide s'il y en a un, avec un tableau 'explication' contenant la raison de pertinence ou non pertinence pour chaque article analysé.
      `
      }
    }
  }

  generateArticle(article?: any): any {
    return {
      systemRole: {"role": "system","content":`

       Tu es chargé de réécrire un article détaillé pour un blog de jardinage situé à Bruxelles,
       en préservant un maximum de détails techniques et contextuels tout en intégrant de nouveaux éléments pertinents si nécessaire.
       Inclue une touche d'humour subtilement. Élabore un article structuré en HTML valide tenant compte des enjeux écologiques.
       Présente l'article sous forme de JSON en respectant la structure fournie.

# Instructions
- **Titre**: Crée un titre court et pertinent pour l'article.
- **Phrase accroche**: Rédige une phrase accrocheuse d'environ 45 mots pour encourager la lecture.
- **Article**: Écris l'article en HTML valide, minifié sur une seule ligne avec des caractères spéciaux échappés, suivant cette structure :
  - 6 paragraphes, chaque paragraphe avec :
    - **Texte du paragraphe** sous forme <span id="paragraphe-{n}">
    <h4>Ecris un titre accrocheur du paragraphe {n}</h4>
    <ul><li>Trouve une question en sous-titre du paragraphe {n} (environ 10 mots)</li></ul>
    <p>Rédige un texte du paragraphe {n} avec minimum 200 mots et pas moins !</p>
    </span>
    - **Citation**: Trouve et inclue une citation célèbre qui se rapporte au sujet traité.
    - **Liens**: Mentionne le premier lien utilisé pour rédiger le post sous "lien1".
    - **Catégorie**: Choisis une catégorie adéquate parmi celles fournies par ${afficherCategories(', ')}.

  # Output Format
    Présente le résultat sous la forme d'un JSON valide structuré comme suit :
{
  "titre": "Titre court pertinent pour le post.",
  "phrase_accroche": "Phrase accrocheuse d'environ 45 mots.",
  "article": "
  <span id="paragraphe-1">
  <h4>Ecris un titre accrocheur du paragraphe 1</h4>
  <ul><li>Trouve une question en sous-titre du paragraphe 1 (environ 10 mots)</li></ul>
  <p>Rédige un texte du paragraphe 1 avec minimum 200 mots et pas moins !</p>
  </span> (Continuer ainsi pour tous les paragraphes avec minimum 200 mots et pas moins par paragraphe !, minifié sur une seule ligne).",
  "citation": "Citation célèbre pertinente avec son auteur si connu.",
  "lien_url_article": {
    "lien1": "URL du premier lien utilisé."
  },
  "categorie": "Catégorie choisie parmi proposées."
}

  # Notes
    - Ne renvoie qu'un seul objet JSON sans autre texte ou structuration.
    - Assure l'articulation logique et l'alignement du contenu avec le thème pour le lecteur cible.
    - Utilise des balises HTML appropriées et garantis la validité du code généré.
      `},
      userRole: { "role": "user", "content": `utilise les informations contenu sur la page dont l 'url est la suivante:  ${article} pour remplir les infos.` }
    }
  }

  upgradeArticle(article: any): any {
    return {
      systemRole: {"role": "system","content":`
Improve a segment of a landscaper's blog entry by adding additional information that complements the existing content. This can include current concrete examples, practical information, numerical data, statistics, or scientific data.

# Steps
- Read the provided segment of the blog attentively to understand the context and key points discussed.
- Identify areas where additional details or examples would enhance the information presented.
- Research and gather relevant current examples, practical tips, numerical data, statistics, or scientific data that would complement the existing information.
- Add the new information in a seamless manner that maintains the original style and tone of the blog post.

# Output Format
Provide the enhanced blog segment in a valid JSON format as follows: {"upgraded": "Response upgraded chapitre..."} Ensure the content is integrated smoothly and maintains the fundamental structure and intent of the original content.

# Examples
**Original Segment:**
"Un bon entretien de la pelouse commence par une coupe régulière. Mais saviez-vous qu'il y a des techniques pour améliorer la santé de votre gazon?"

**Enhanced Segment:**
{"upgraded": "Un bon entretien de la pelouse commence par une coupe régulière. Saviez-vous que pour optimiser la santé de votre gazon, il est recommandé de ne pas tondre plus d'un tiers de la longueur des brins lors de chaque coupe? Par exemple, durant les mois d'été, tondre la pelouse à une hauteur de 5 cm permet de conserver l'humidité et d'améliorer la photosynthèse. De plus, une étude de 2022 a démontré que l'application d'engrais azotés au printemps augmente la densité du gazon de 25% en moyenne."}

# Notes
- Ensure all added information is accurate and up-to-date.
- Maintain consistency in writing style and use of language to blend seamlessly with the original content.
    `},
      userRole: { "role": "user", "content": `Voici le texte à améliorer ${article}.` }
    }
  }

  formatInHtmlArticle(article: string): any {
    return {
      systemRole: {"role": "system","content":`
     Intégrer des balises HTML aux textes afin de structurer le contenu et en améliorer la lisibilité, sans modifier le contenu texte ou les balises HTML déjà présentes.
- Respecter les étapes suivantes pour la mise en forme.
# Steps
1. Entourer les phrases clés avec la balise \`<b>\` pour les mettre en évidence et attirer l'attention du lecteur.
2. Intégrer un emoji pertinent illustrant le sujet du paragraphe à l'intérieur du titre en \`<h4>\` déjà présent sans ajouter de nouveaux \`<h4>\`.
3. Adapter le formatage en fonction du type de contenu :
   - Utiliser \`<ol><li></li></ol>\` pour toutes les listes.
   - Utiliser la balise \`<u>\` pour souligner des informations spécifiques.
   - Utiliser \`<em>\` pour mettre en valeur des termes importants.
   - Encapsuler le contenu tabulaire dans des balises \`<table><tr><td></td></tr></table>\`.
# Output Format
Présenter le résultat sous la forme d'un JSON valide structuré comme suit :
{
  "upgraded": "<html_content_here>"
}
# Examples
**Input**:
Un texte avec du contenu varié, incluant des phrases clés, des titres, des listes et des informations tabulaires existantes.
**Output**:
{
  "upgraded": "<h4>🎨 Présentation du Projet </h4><b>Phrases clés importantes.</b><ul><li>Point 1</li><li>Point 2</li></ul><table><tr><td>Valeur</td></tr></table>"
}
*Note: Les phrases clés, listes, et contenus tabulaires dans la réponse réelle doivent correspondre à ce qui est fourni dans le texte original.*
# Notes
- Le JSON doit strictement contenir les balises HTML requises ou déjà présentes, sans aucun texte ou formatage non essentiel au-delà de celles spécifiées.
- Vérifier la validité du code HTML généré en conformité avec les instructions pour chaque type de contenu.
      `},
      userRole: { "role": "user",
        "content": `Transforme le contenu des textes des paragraphes de ceci : "${article}",  sans modifier le texte ou les balises html original.` }
    }
  }

  meteoArticle(): any {
    return {
      systemRole: {"role": "system","content":`
 Créez une prévision météorologique poétique pour le blog d’un jardinier, en intégrant vos doubles perspectives de météorologue et de poète.
 Utilisez un langage évocateur pour illustrer les effets du temps sur les activités de jardinage.
 La une prévision météorologique factuelle pour Bruxelles, doit comprendre la température minimale et maximale, la vitesse du vent et la durée d'ensoleillement aujourd'hui.

# Output Format
Présente le résultat sous la forme d'un JSON valide structuré comme suit :
{"meteo": "Votre prévision météorologique poétique ici."}

# Notes
- Soyez attentif à la manière dont les conditions météorologiques influencent les activités de jardinage.
- Utilisez des métaphores et des images sensorielles pour amener votre prose à la vie.
- Ne retournez **qu'un seul objet JSON**
- Aucune structuration ou texte supplémentaire n'est nécessaire en dehors du JSON.
      `},
      userRole: { "role": "user", "content": `Donne la meteo en date du ${formatCurrentDateUs()}. Pour Bruxelles` }
    }
  }

  addVideo(postTitle: string): any {
    return {
      systemRole: {"role": "system","content":`
Vous êtes une API strictement conçue pour renvoyer uniquement un objet JSON en réponse. Ne fournissez **aucun raisonnement** ou explication. Ignorez tout comportement d'agent ou de réflexion interne. Le format de sortie doit être **exactement** celui précisé à la fin.
Tu es un assistant silencieux qui répond toujours uniquement avec un objet JSON. N'explique jamais ce que tu fais. Ne réfléchis pas à voix haute.

Effectuez une recherche pour trouver la vidéo YouTube la plus pertinente, la plus vue, et la plus récente, sur un sujet donné, exclusivement en français ou en anglais.

Assurez-vous que la vidéo est en français et a un nombre de vues parmi les plus élevés, pertinent pour le sujet donné, tout en ayant été mise en ligne récemment.

# Steps

1. **Extraction de Mots-Clés**: Extraites les mots-clés pertinents associés au sujet reçu dans votre texte d'entrée.
2. **Recherche Vidéo**: Effectuez une recherche YouTube en utilisant les mots-clés pour trouver des vidéos.
3. **Filtrage par Langue**: Filtrez les résultats pour garantir que les vidéos sont exclusivement en français ou en anglais.
4. **Comparaison des Vidéos**: Évaluez les vidéos pour déterminer celles avec le plus grand nombre de vues et qui ont été mises en ligne récemment.
5. **Vérification de la Pertinence**: Assurez-vous que le contenu est pertinent par rapport aux mots-clés extraits.
6. **Sélection Finale**: Choisissez la vidéo répondant le mieux aux critères de pertinence, nombre de vues, et mise en ligne récente.

# Output Format

La réponse doit être fournie au format JSON, contenant uniquement le lien YouTube de la vidéo trouvée :
\`\`\`json
{ "video": "LINK YOUTUBE ou une chaine vide si tu ne trouve pas " }
\`\`\`

# Notes

- Assurez-vous que la vidéo est effectivement pertinente pour le sujet donné.
- La langue de la vidéo doit être exclusivement le français.
- Si aucune vidéo appropriée n’est trouvée, retournez un champ vide.
- Priorisez la pertinence du contenu et le nombre de vues, mais veillez à ce que la vidéo soit récente.
- Ne fournir que l'objet JSON demandé, sans texte additionnel, ou de reflexion ni d'explication et pas de <think>, JUSTE LA REPONSE JSON !!!.
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet pour trouver la video : ${postTitle}` }
    }
  }

  searchVideoFromYoutubeResult(postTitle: string): any {
    return {
      systemRole: {"role": "system","content":`
Vous êtes une API strictement conçue pour renvoyer uniquement un objet JSON en réponse. Ne fournissez **aucun raisonnement** ou explication. Ignorez tout comportement d'agent ou de réflexion interne. Le format de sortie doit être **exactement** celui précisé à la fin.
Tu es un assistant silencieux qui répond toujours uniquement avec un objet JSON. N'explique jamais ce que tu fais. Ne réfléchis pas à voix haute.

Effectuez une recherche pour trouver la vidéo YouTube la plus pertinente, la plus vue, et la plus récente, sur un sujet donné, exclusivement en français ou en anglais.

Assurez-vous que la vidéo est en français et a un nombre de vues parmi les plus élevés, pertinent pour le sujet donné, tout en ayant été mise en ligne récemment.

# Steps

1. **Extraction de Mots-Clés**: Extraites les mots-clés pertinents associés au sujet reçu dans votre texte d'entrée.
2. **Recherche Vidéo**: Effectuez une recherche YouTube en utilisant les mots-clés pour trouver des vidéos.
3. **Filtrage par Langue**: Filtrez les résultats pour garantir que les vidéos sont exclusivement en français ou en anglais.
4. **Comparaison des Vidéos**: Évaluez les vidéos pour déterminer celles avec le plus grand nombre de vues et qui ont été mises en ligne récemment.
5. **Vérification de la Pertinence**: Assurez-vous que le contenu est pertinent par rapport aux mots-clés extraits.
6. **Sélection Finale**: Choisissez la vidéo répondant le mieux aux critères de pertinence, nombre de vues, et mise en ligne récente.

# Output Format

La réponse doit être fournie au format JSON, contenant uniquement le lien YouTube de la vidéo trouvée :
\`\`\`json
{ "video": "LINK YOUTUBE ou une chaine vide si tu ne trouve pas " }
\`\`\`

# Notes

- Assurez-vous que la vidéo est effectivement pertinente pour le sujet donné.
- La langue de la vidéo doit être exclusivement le français.
- Si aucune vidéo appropriée n’est trouvée, retournez un champ vide.
- Priorisez la pertinence du contenu et le nombre de vues, mais veillez à ce que la vidéo soit récente.
- Ne fournir que l'objet JSON demandé, sans texte additionnel, ou de reflexion ni d'explication et pas de <think>, JUSTE LA REPONSE JSON !!!.
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet pour trouver la video : ${postTitle}` }
    }
  }

  getPromptGenericSelectKeyWordsFromChapitresInArticle(titreArticle: string, chapitreKeyWordList: string[]) {
    return {
      systemRole: {
        role: "system",
        content: this.getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle()
      },
      userRole: {
        role: "user",
        content: this.getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle, chapitreKeyWordList)
      }
    }
  }

  getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle(){
    return `Identifie le mot-clé unique le plus pertinent à partir du titre d'un blog pour effectuer une recherche d'image sur le site Unsplash.com.
Extrait un seul mot-clé du titre du blog. Assure-toi que ce mot résume efficacement l'essence du titre ou capte l'atmosphère centrale pour maximiser la pertinence des images recherchées.
# Steps
1. **Analyse du Titre**: Lis attentivement le titre du blog et les concepts clés et le thème principal.
2. **Sélection du Mot-clé**: Choisis un mot unique qui encapsule le sujet principal ou l'atmosphère globale du titre et traduis le en anglais.
2. **Explication du Mot-clé**: Explique pourquoi ce mot clefs.
3. **Vérification**: Assure-toi que le mot-clé choisi est général et suffisamment représentatif pour être utilisé efficacement dans une recherche d'image.
# Output Format
- Fournis un seul mot en résultat, représentant le mot-clé choisi sous cette forme json {"keyWord":"Mots choisis", "explanation":""}.
# Examples
**Input**: "Exploration des merveilles de l'océan: secrets des abysses"
**Reasoning**:
- Le titre parle de l'océan et des secrets cachés sous l'eau.
- Le mot "océan" capture bien le sujet principal.
**Output**: "{"keyWord":"ocean", "explanation":"Le mot océan capture bien le sujet principal"} et rien d 'autre, ne rajoute pas de texte ou d explication dans la réponse !
---
**Input**: "Les charmes hivernaux des montagnes enneigées"
**Reasoning**:
- Ce titre met l'accent sur un paysage spécifique et une ambiance saisonnière.
- Le mot "montagnes" est central pour la recherche visuelle.
**Output**: "{"keyWord":"mountains", "explanation":"Le mot montagnes est central pour la recherche visuelle"}"
# Notes
- Si le titre contient plusieurs thèmes, choisis le mot-clé qui représente le mieux le message principal ou l'élément le plus visuel.
- Le mot-clé choisi doit être suffisamment large pour couvrir un éventail d'images mais précis pour rester pertinent.`
  }

  getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle: string, chapitreKeyWordList: string[]){
    return `Voici le titre: ${titreArticle}.
    Si la liste n'est pas vide : ( ${chapitreKeyWordList} ) , choisi un autre mot que ceux qui sont deja dans cette liste.`
  }

  getPromptGenericSelectBestImageForChapitresInArticle(article: string, images: any) {
    return {
      systemRole: {
        role: "system",
        content: this.getPerplexityPromptSystemcSelectBestImageForChapitresInArticle()
      },
      userRole: {
        role: "user",
        content: this.getPerplexityPromptUserSelectBestImageForChapitresInArticle(article, images)
      }
    }
  }

  getPerplexityPromptSystemcSelectBestImageForChapitresInArticle(){
    return `Analyse the provided text to identify the main themes and concepts, then select the most representative image from the provided list for a gardening blog post.

You are given a text, and a list of image URLs. Your task is to extract key themes and concepts from the text and choose one image from the list that best represents these elements for inclusion in a blog post. Ensure that the selected image effectively illustrates the relevant ambiance and visual elements.

# Steps

1. **Read and Understand the Text**: Analyze  to identify the main themes and concepts. Focus on identifying elements that are visually significant or central to the message intended for a gardening audience.

2. **Evaluate Images**: Examine each image from to determine how well it matches the identified themes and concepts.

3. **Selection Criteria**: Choose the image that aligns best with the theme, ensuring it represents the ambiance and the key elements of the text.

4. **Explanation**: Provide reasoning for the selection of the chosen image and explanations for why other images were not selected.

# Output Format

Provide the output in JSON format as follows:
\`\`\`json
    {
      "imageUrl": "url",
      "explanation": "explication de la première image en francais"
    }
    \`\`\`

- The 'imageUrl' is the URL of the chosen image.
- Each 'raisonImage' corresponds to an image from the list, with a brief explanation of why it was selected or not selected.

# Examples

**Input Example:**

- Article Text: "Les tomates sont parfaites pour les climats chauds."
- Images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]

**Output Example:**

\`\`\`JSON
    {
      "imageUrl": "https://example.com/image1.jpg",
      "explanation": "Choisi pour la raison suivante..."
    }
    \`\`\`

# Notes

- The decoding process should emphasize the image's relevance to the gardening context.
- Ensure clarity and relevance in each explanation provided for image choices.`
  }

  getPerplexityPromptUserSelectBestImageForChapitresInArticle(article: string, images: any){
    return `Voici le texte  à analyser : "${article}", ainsi qu'une liste d'URL d'images "${JSON.stringify(images)}".`
  }

  getOpenAiPromptImageGenerator(description: string): string {
   return `Générez une description pour créer une image hyper réaliste sans texte ni représentations humaines, à partir d'un sujet donné que voici : ${description}.
    Cette image servira d'illustration pour un blog.

- **Focus**: Concentrez-vous sur le sujet fourni et utilisez uniquement des éléments pertinents au thème.
- **Style**: Hyper réaliste, comme une photographie. Imaginez des détails précis et vibrants pour donner vie à l'image.
- **Contenu**: Excluez tout texte, ainsi que toute trace de figures humaines ou partie de figures humaines.

# Étapes

1. Identifiez le sujet de l'image à créer.
2. Imaginez l'image en vous concentrant sur l'élément principal.
3. Visualisez les éléments additionnels qui renforceront le réalisme sans distraire de l'élément central.
4. Conceptualisez l'image finale.

# Format de Sortie

Fournir une description détaillée en texte décrivant visuellement l'image.

# Notes

- Assurez-vous que l'image proposée soit suffisamment neutre pour s'adapter à divers contextes blog.
- Vérifiez que les éléments choisis sont en accord avec le thème choisi, tout en respectant l'interdiction de tout texte ou forme humaine.`
  }

  getPromptGenericAddInternalLinkInArticle(article: any, listTitreId: any): any {
    return {
      systemRole: {
        role: "system",
        content: this.getPromptSystemAddInternalLinkInArticle()
      },
      userRole: {
        role: "user",
        content: this.getPromptUserAddInternalLinkInArticle(article, listTitreId)
      }
    }
  }
  getPromptSystemAddInternalLinkInArticle() {
    return `
Embed a specific hyperlink into an article using an HTML tag according to detailed guidelines, without altering the article's text or html beyond the insertion.

## Détails de la Tâche

- **Source des Liens**: Utilisez un fichier JSON contenant une liste d'articles, chacun avec un 'id' et un 'titre'.
- **Insertion du Lien**: Faites un lien judicieux entre un des titres du JSON et le texte de l'article en intégrant une balise de lien hypertexte.
- **Règles de Placement**: Un seul lien doit être inséré par article, en priorité sur les occurrences les plus spécifiques du titre.
- **Exactitude**: Ne pas modifier le texte d'origine ni du HTML déjà présent, sauf pour l'insertion du lien.

# Steps

1. **Identifier le Titre**:
   - Parcourez les titres spécifiés dans le JSON et le contenu de l'article pour détecter un lien entre un mot-clé et un titre de la liste.

2. **Insérer la Balise de Lien Hypertexte**:
   - Suivez ce format : \`<a class="myTooltip" href="https://jardin-iris.be/blog-detail.html?post={id}" id="{id}" title="{titre}">{mots_clés}</a>\`
   - Remplacez les éléments par :
     - {id} : l'identifiant unique de l'article référencé dans le JSON.
     - {titre} : le titre exact de l'article tel que fourni par le JSON.
     - {mots_clés} : le texte exact de l'article qui coïncide avec le titre.

3. **Assurez-vous de la Précision**:
   - Confirmez que le lien est correctement inséré sans altérer le texte original.

# Output Format

Présentez le résultat comme suit:

\`\`\`JSON
{
  "upgraded": "<html_content_here>",
  "idToRemove": "id"
}
\`\`\`

# Notes

- Assurez une correspondance minimum entre le mot-clé dans le texte et les titres du JSON.
- Veillez à n'insérer qu'un seul lien par article pour éviter toute redondance.
`;
  }

  getPromptUserAddInternalLinkInArticle(article: string, listTitreId: any): string {
    return `Voici un tableau JSON contenant des articles avec les champs 'titre' et 'id' : ${JSON.stringify(listTitreId)}.
    Voici l'article à traiter : ${JSON.stringify(article)}. Insérez le lien hypertexte conformément aux directives fournies, sans modifier le texte original
`;
  }

}
