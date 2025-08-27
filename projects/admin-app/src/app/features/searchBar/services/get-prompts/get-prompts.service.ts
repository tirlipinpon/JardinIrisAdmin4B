import { Injectable } from '@angular/core';
import {afficherCategories} from "../../../../utils/afficherCategories";
import {formatCurrentDateUs} from "../../../../utils/getFormattedDate";
import {VideoInfo} from "../../../all/services/google-search/google-search.service";
import {afficherRandomSeoKeyWords} from "../../../../utils/afficherRandomSeoKeyWords";

@Injectable({
  providedIn: 'root'
})
export class GetPromptsService {

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
Tu es un rédacteur humain jardinier paysagiste qui écrit un blog pour proposer ses ervicess, pas une IA. Écris comme si tu racontais, avec un ton naturel, vivant et parfois familier Utiliser un ton professionnel mais accessible aux jardiniers amateurs.. Varie la longueur des phrases, évite les structures trop parfaites et bannis les conclusions scolaires.
Ajoute des digressions légères, des détails techniques récents et concrets, ainsi qu’un peu d’imprévu comme dans une vraie conversation. Insère des exemples vécus proffessionel, des conseils pratiques et une touche d’humour subtile.
N’hésite pas à employer "je", "tu" ou "on" et laisse passer de petites imperfections pour garder un style spontané.
Tu dois réécrire un article détaillé pour un blog de jardinage situé à Bruxelles en respectant les normes SEO. Intègre les mots-clés suivants : "${afficherRandomSeoKeyWords()}", et applique les critères EEAT (Expertise, Experience, Authoritativeness, Trustworthiness).
Conserve un maximum de détails techniques pertinents et ajoute de nouveaux éléments utiles, adaptés au contexte écologique et local.
L’article doit être présenté sous format JSON valide selon la structure définie ci-dessous, et rédigé en HTML minifié (une seule ligne, sans retour à la ligne, avec les caractères spéciaux échappés).
Instructions de génération
Titre : Formule une question informationnelle courte et pertinente qui donne envie de lire.
Phrase accroche : Environ 45 mots, style transactionnel, incitant à la lecture.
Article : 6 paragraphes structurés comme suit :

<span id="paragraphe-{n}">
  <h4>Une question informationnelle comme titre</h4>
  <ul><li>Un sous-titre accrocheur d’environ 10 mots</li></ul>
  <article>Texte du paragraphe d’au moins 200 mots, riche, concret, humain, détaillé, avec des conseils pratiques, une touche d’humour subtile et une fluidité naturelle.</article>
</span>

Chaque paragraphe doit contenir au moins 200 mots réels (pas moins !).
Inclure une citation célèbre pertinente en lien avec le jardinage, la nature ou la vie (sans doubles guillemets dans le texte, auteur si connu).
Mentionner le premier lien utilisé dans "lien1".
Sélectionner une seule catégorie parmi celles proposées par : "${afficherCategories(', ')}".
Format de sortie attendu (strictement un seul objet JSON, rien d’autre) :
{
  "titre": "Titre court pertinent pour le post.",
  "phrase_accroche": "Phrase accrocheuse d'environ 45 mots.",
  "article": "<span id=\"paragraphe-1\"><h4>Titre questionnel</h4><ul><li>Sous-titre accrocheur</li></ul><article>Texte du paragraphe (200 mots minimum).</article></span> ... (jusqu'à paragraphe-6, minifié sur une ligne)",
  "citation": "Citation pertinente avec auteur.",
  "lien_url_article": {
    "lien1": "URL du premier lien utilisé."
  },
  "categorie": "Catégorie choisie parmi celles proposées."
}

Notes
Rédige avec un style humain et vivant, sans ton académique ni IA.
Assure la validité HTML et JSON.
Aligne chaque paragraphe avec les enjeux écologiques et pratiques du jardinage à Bruxelles.
`},
      userRole: { "role": "user", "content": `utilise les informations contenu sur la page dont les infos se trouve ici:  "${article}" pour remplir les infos.` }
    }
  }

  upgradeArticle(article: any): any {
    return {
      systemRole: {"role": "system","content":`
Improve a segment of a landscaper's blog entry by adding additional information that complements the existing content.
This can include current concrete examples, practical information, numerical data, statistics, or scientific data.

# Steps
- Read the provided segment of the blog attentively to understand the context and key points discussed.
- Identify areas where additional details or examples would enhance the information presented.
- Research and gather relevant current examples, practical tips, numerical data, statistics, or scientific data that would complement the existing information.
- Add the new information in a seamless manner that maintains the original style and tone of the blog post.

# Output Format
Provide the enhanced blog segment in a valid JSON format as follows: {"upgraded": "Response upgraded paragraphe..."} Ensure the content is integrated smoothly and maintains the fundamental structure and intent of the original content.

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
1. Entourer une phrase clés avec la balise \`<b>\` pour le mettre en évidence et attirer l'attention du lecteur.
2. Intégrer un emoji pertinent illustrant le sujet du paragraphe à l'intérieur du titre en \`<h5>\` déjà présent sans ajouter de nouveaux \`<h5>\`.
3. Adapter le formatage en fonction du type de contenu :
   - Utiliser \`<ol><li></li></ol>\` pour toutes les listes.
   - Utiliser la balise \`<u>\` pour souligner une seule phrase spécifique.
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
  "upgraded": "<h5>🎨 Présentation du Projet </h5><br><b>Phrase clés importante.</b><ul><li>Point 1</li><li>Point 2</li></ul><table><tr><td>Valeur</td></tr></table>"
}
*Note: Les phrases clés, listes, et contenus tabulaires dans la réponse réelle doivent correspondre à ce qui est fourni dans le texte original.*
# Notes
- Ne pas utiliser les balise <p></p>
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
 Créez une prévision météorologique  en +-50 mots pour le blog d’un jardinier, en intégrant vos perspectives de météorologue basé sur l'institut météorologique Belge (IRM).
 Une prévision météorologique factuelle pour Bruxelles, doit comprendre la température minimale et maximale et levée du soleil  sur le courent de la journée,
 la vitesse du vent et la durée d'ensoleillement et la pluviométrie ansi que le levé et le couché du soleil pour la date d'aujourd'hui.
 Ajouter icones qui illustre le texte.

# Output Format
Présente le résultat sous la forme d'un JSON valide structuré comme suit :
{"meteo": "Votre prévision météorologique ici  +- 50 mots."}

# Notes
- Ne retournez **qu'un seul objet JSON**
- Aucune structuration ou texte supplémentaire n'est nécessaire en dehors du JSON.
      `},
      userRole: { "role": "user", "content": `Donne la météo en date du ${formatCurrentDateUs()}. Pour Bruxelles` }
    }
  }

  getPromptSelectKeyWordsSeoUrl(postTitre: string): any {
    return {
      systemRole: {"role": "system","content":`
      Créer une URL SEO-friendly pour un article de blog de jardinage en utilisant un titre et des mots-clés fournis.

Tu recevras un titre d'article de blog et des mots clés associés. Utilise ces directives pour créer une URL SEO-friendly:

- Inclure le mot-clé principal.
- Utiliser des tirets pour séparer les mots.
- Éviter les caractères spéciaux tels que les accents, &, %, etc.
- Supprimer les mots inutiles (par exemple, le, la, de, pour, etc., ).
- Utiliser uniquement des minuscules.
- Maintenir l'URL aussi courte que possible tout en restant claire.

# Steps

1. Identifier le mot-clé principal parmi les mots-clés fournis.
2. Transformer les les mots-clés et titre de l'article de blog en un format URL.
3. Supprimer les mots inutiles et les caractères spéciaux des mots.
4. Séparer les mots avec des tirets et utiliser uniquement des lettres minuscules pour l'URL.
5. Veiller à ce que l'URL soit concise tout en restant claire.

# Output Format

La réponse doit être fournie au format JSON:
\`\`\`json
{ "url": "Retourner l'URL sous forme de texte brut, sans guillemets" }
\`\`\`

# Examples

**Entrée:**
- Mots-clés: "jardinier", "paysagiste"
- Titre de l'article: "Comment entretenir vos plantes d'intérieur facilement"

**Sortie:**
- { "url": "jardinier-paysagiste-entretien-plantes-interieur-facilement" }

# Notes

- Assurez-vous que l'URL est claire, concise, et respectueuse des bonnes pratiques SEO.
- Ne pas inclure des caractères accentués ou des majuscules.
- Le mot-clé principal doit être placé au début de l'URL.
      `},
      userRole: { "role": "user", "content": `Voici les mots clefs: "${afficherRandomSeoKeyWords()}" et le titre du blog : "${postTitre}". ` }
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

  getPromptFaq(upgradedArticle: string): any {
    return {
      systemRole: {"role": "system","content":`
Pour chaque article contenant des paragraphes balisés, générez des questions et réponses pertinentes pour chaque paragraphe, sous forme d'objet JSON.

1. **Identifier les paragraphes**: Repérez les paragraphes dans l'article à l'aide des balises \`<span id="paragraphe-#">...texte...</span>\`.
2. **Formuler une question**: Pour chaque paragraphe, posez une question d'environ 10 mots qui approfondit le contenu au-delà de ce qui est fourni.
3. **Fournir une réponse**: Proposez une réponse avec des informations supplémentaires pertinentes à la question formulée.

# Steps

1. Parcourir l'article pour repérer les paragraphes à l'aide des balises HTML spécifiques.
2. Lire le contenu de chaque paragraphe afin de comprendre les points clés.
3. Formuler une question par paragraphe qui irait plus loin dans le sujet abordé dans le texte.
4. Rédiger une réponse qui complète la question avec des détails ou informations supplémentaires.

# Output Format

Présentez les questions et réponses sous forme d'un objet JSON structuré, sans texte supplémentaire :

\`\`\`json
[
  {
    "question": "la question pour le paragraphe 1",
    "response": "la réponse pour le paragraphe 1"
  },
  {
    "question": "la question pour le paragraphe 2",
    "response": "la réponse pour le paragraphe 2"
  }
  // A continuer pour chaque paragraphe
]
\`\`\`

# Notes

- Assurez-vous que les questions et réponses fournies sont pertinentes et approfondissent le sujet discuté dans chaque paragraphe.
- Ne retournez que l'objet JSON attendu, sans inclusion de texte explicatif ou supplémentaire.
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet pour les questions : ${upgradedArticle}` }
    }
  }

  searchVideoFromYoutubeResult(postTitle: string, videoList: VideoInfo[]): any {
    const videoDescriptions = videoList
      .filter((v, i, arr) => arr.findIndex(v2 => v2.videoId === v.videoId) === i)
      .map((video, index) => {
        return `Vidéo ${index + 1}:
        - ID : ${video.videoId}
        - Chaîne : ${video.channelTitle}
        - Description : ${video.description || 'Aucune description'}
        `;
      });

    return {
      systemRole: {"role": "system","content":`
Parcourez une liste d'objets pour trouver la vidéo qui correspond le mieux au sujet fourni.

Étant un assistant silencieux, renvoyez uniquement un objet JSON sans fournir de raisonnement ou d'explication. Ne réfléchissez pas à voix haute.

- Vous recevrez une liste d'objets VideoInfo contenant :
  - \`videoId\`: un identifiant unique pour la vidéo
  - \`channelTitle\`: le titre de la chaîne
  - \`description\`: la description de la vidéo

Comparez ces données pour identifier la vidéo correspondant le mieux au sujet fourni.

# Output Format

La réponse doit être fournie dans un objet JSON contenant uniquement le lien YouTube de la vidéo trouvée ou une chaîne vide si aucune vidéo ne correspond:
\`\`\`json
{
"video": "LINK YOUTUBE ou une chaine vide si tu ne trouve pas ",
 explanation": "explication de ton choix par rapport au titre du sujet"}
\`\`\`
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet : "${postTitle}";  et la site de videos à comparer : "${videoDescriptions.join('\n')}".
      ` }
    }
  }

  getPromptGenericSelectKeyWordsFromChapitresInArticle(titreArticle: string, paragrapheKeyWordList: string[]) {
    return {
      systemRole: {
        role: "system",
        content: this.getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle()
      },
      userRole: {
        role: "user",
        content: this.getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle, paragrapheKeyWordList)
      }
    }
  }

  getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle(){
    return `Identifie le mot-clé unique le plus pertinent à partir du titre d'un blog pour effectuer une recherche d'image sur le site Unsplash.com.
Extrait un seul mot-clé du titre du blog. Assure-toi que ce mot résume efficacement l'essence du titre ou capte l'atmosphère centrale pour maximiser la pertinence des images recherchées.
# Steps
1. **Analyse du Titre**: Lis attentivement le titre du blog et les concepts clés et le thème principal.
2. **Sélection du Mot-clé**: Choisis un mot unique qui encapsule le sujet principal ou l'atmosphère globale du titre et traduis le en anglais.
2. **Explication du Mot-clé**: Explique pourquoi ce mot clefs a été choisis.
3. **Vérification**: Assure-toi que le mot-clé choisi est général et suffisamment représentatif pour être utilisé efficacement dans une recherche d'image.
# Output Format
- Fournis un seul mot en résultat, représentant le mot-clé choisi sous cette forme json {"keyWord":"Mots choisis", "explanation":""}.
# Examples
**Input**: "Exploration des merveilles de l'océan: secrets des abysses"
**Reasoning**:
- Le titre parle de l'océan et des secrets cachés sous l'eau.
- Le mot "océan" est choisis parce que... .
**Output**: "{"keyWord":"ocean", "explanation":"Le mot océan est choisis parce que..."} et rien d 'autre, ne rajoute pas de texte ou d explication dans la réponse !
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

  getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle: string, paragrapheKeyWordList: string[]){
    return `Voici le titre: ${titreArticle}.
    Si la liste n'est pas vide : ( ${paragrapheKeyWordList} ) , choisi un autre mot que ceux qui sont deja dans cette liste.`
  }

  getPromptGenericSelectBestImageForChapitresInArticleWithVision(article: string, images: string[]) {
    return {
      systemRole: {
        role: "system",
        content:  `Analyse the provided text to identify the main themes and concepts, then select the most representative image from the provided list
         for a gardening blog post.

You are given a text, and a list of image URLs. Your task is to extract key themes and concepts from the text and choose one image from the list that
best represents these elements for inclusion in a blog post. Ensure that the selected image effectively illustrates the relevant ambiance and visual elements.

# Steps

1. **Read and Understand the Text**: Analyze  to identify the main themes and concepts. Focus on identifying elements that are visually significant or
central to the message intended for a gardening audience.

2. **Evaluate Images**: Examine each image from to determine how well it matches the identified themes and concepts.

3. **Selection Criteria**: Choose the image that aligns best with the theme, ensuring it represents the ambiance and the key elements of the text.

# Output Format

Provide the output in JSON format as follows:
\`\`\`json
    {
      "imageUrl": "url",
    }
    \`\`\`

- The 'imageUrl' is the URL of the chosen image.
- Each 'raisonImage' corresponds to an image from the list.

# Examples

**Input Example:**

- Article Text: "Les tomates sont parfaites pour les climats chauds."
- Images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]

**Output Example:**

\`\`\`JSON
    {
      "imageUrl": "https://example.com/image1.jpg",
    }
    \`\`\`
    `
      },
      userRole: {
        role: "user",
        content: `Voici le texte  à analyser : "${article}", ainsi qu'une liste d'URL d'images ${JSON.stringify(images)}.`
      }
    }
  }

  getOpenAiPromptImageGenerator(description: string): string {
   return `Générez une description pour créer une image hyper réaliste sans texte ni représentations humaines, à partir d'un sujet donné que voici : ${description}.

- **Focus**: Concentrez-vous sur le sujet fourni et utilisez uniquement des éléments pertinents au thème.
- **Style**: Hyper réaliste, comme une photographie. Imaginez des détails précis et vibrants pour donner vie à l'image.
- **Contenu**: Excluez tout texte, ainsi que toute trace de figures humaines ou partie de figures humaines.

# Étapes

1. Identifiez le sujet de l'image à créer.
2. Imaginez l'image en vous concentrant sur l'élément principal.
3. Visualisez les éléments additionnels qui renforceront le réalisme sans distraire de l'élément central.

# Format de Sortie

Fournir une description détaillée en texte décrivant visuellement l'image.

# Notes

- Assurez-vous que l'image proposée soit suffisamment neutre pour s'adapter à divers contextes blog.
- Vérifiez que les éléments choisis sont en accord avec le thème choisi, tout en respectant l'interdiction de tout texte ou forme humaine.`
  }

  addInternalLinkInArticle(article: any, listTitreIdHref: any): any {
    return {
      systemRole: {
        role: "system",
        content: this.getPromptSystemAddInternalLinkInArticle(listTitreIdHref)
      },
      userRole: {
        role: "user",
        content: this.getPromptUserAddInternalLinkInArticle(article, listTitreIdHref)
      }
    }
  }

  getPromptSystemAddInternalLinkInArticle(newHref: string) {
    return `
Embed a specific hyperlink into an article using an HTML tag, following the detailed guidelines without altering any text or HTML beyond the insertion.

## Détails de la Tâche
- **Source des Liens**: Utilisez un fichier JSON contenant une liste d'articles avec des champs 'id', 'titre', et 'new_href'.
- **Insertion du Lien**: Identifiez un titre correspondant dans le texte de l'article et insérez une balise de lien hypertexte.
- **Règles de Placement**: Insérez un seul lien par article en privilégiant les occurrences les plus spécifiques du titre.
- **Exactitude**: Ne modifiez pas le texte d'origine ou le HTML existant, sauf pour la balise de lien.

# Steps
1. **Identifier le Titre**:
   - Analysez les titres dans le JSON et le contenu de l'article pour identifier une correspondance avec les mots-clés dans le texte.

2. **Insérer la Balise de Lien Hypertexte**:
   - Si {new_href} existe and not NUll : '<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/${newHref}.html" title="{titre}">{mots_clés}<span class="myTooltiptext">{titre}</span></a>'
   - Sinon : '<a class="myTooltip" href="https://www.jardin-iris.be/blog-detail.html?post={id}" title="{titre}">{mots_clés}<span class="myTooltiptext">{titre}</span></a>'
   - Remplacez:
     - {id} : identifiant de l'article.
     - {titre} : titre de l'article.
     - {mots_clés} : texte dans l'article correspondant au titre.
     - {new_href} : valeur du lien si existante.

3. **Assurez-vous de la Précision**:
   - Confirmez l'insertion correcte sans altération du texte original.

# Output Format
Présentez le résultat dans ce format:

JSON
    {
      "upgraded": "<html_content_here>",
      "idToRemove": "id"
    }


# Notes
- Assurez-vous d'une correspondance minimale entre le mot-clé et les titres du JSON.
- Insérez un seul lien par article pour éviter des redondances.
`;
  }

  getPromptUserAddInternalLinkInArticle(article: string, listTitreIdHref: any): string {
    return `Voici un tableau JSON contenant des articles avec les champs 'titre' et 'id' 'new_href' : ${JSON.stringify(listTitreIdHref)}.
    Voici l'article à traiter : ${JSON.stringify(article)}. Insérez le lien hypertexte conformément aux directives fournies, sans modifier le texte original
`;
  }

  getPromptAddVegetalInArticle(article: string, paragrapheId: number) {
    return {
      systemRole: {
        role: "system",
        content:  `
Tu es un botaniste expert. Analyse le texte suivant et identifie les noms de plantes ou de végétaux spécifiques, c’est-à-dire ceux qui désignent une espèce ou un genre bien défini en botanique.
Ne retiens pas les mots trop vagues, courants ou génériques qui désignent simplement la nature ou des éléments non identifiables avec précision (comme les mots servant à parler de manière générale de la flore ou du paysage).
⚠️ Chaque élément trouvé doit être unique : si un même nom de plante apparaît plusieurs fois dans le texte, il ne doit être balisé qu’une seule fois (aucune duplication).
Entoure chaque mot identifié avec une balise <span> formatée pour un usage potentiel dans le cadre de recherches futures via inaturalist.org.
Retourne le texte modifié sans aucun commentaire ou ajout supplémentaire, et sans modifier le texte de l’article en dehors de l’insertion des balises.
Le but n'est pas de trouver tous les noms les plus communs comme herbe, gazon, branche, haie... mais d’aider des lecteurs qui ne connaîtraient pas.

Étapes
Identifier les noms de plantes qui sont tous en français : analyser le texte pour trouver les mots ou expressions qui correspondent à des noms de plantes.
Rechercher les noms scientifiques : pour chaque nom de plante identifié, déterminer son nom scientifique le plus précis.
Assurer l’unicité : si un nom est répété, ne conserver qu’une seule occurrence balisée.
Format en HTML : entourer chaque nom de plante identifié avec des balises <span> incluant les attributs class, data-taxon-name, data-paragraphe-id.
Remplacer les espaces réservés : remplacer "NOM_SCIENTIFIQUE" dans l’attribut data-taxon-name et alt par le nom scientifique précis et incrémenter la valeur "X" de data-paragraphe-id="${paragrapheId}-X".

Format de sortie attendu
Retourner dans un json valide {"upgraded": "TEXTE_MODIFIE" } le texte modifié avec tous les noms de plantes entourés par des balises span formatées :
{
"upgraded": "<span class="inat-vegetal" data-taxon-name="NOM_SCIENTIFIQUE" data-paragraphe-id="${paragrapheId}-X">MOT_CORRESPONDANCE<div class="inat-vegetal-tooltip"><img src="" alt="NOM_SCIENTIFIQUE"/></div></span>"
}
Exemples
Entrée :
Le jardin de gazon est rempli de roses, de tulipes et de chênes majestueux.
Sortie :
{
"upgraded": "Le jardin de gazon et d'arbres est rempli de
<span class="inat-vegetal" data-taxon-name="Rosa" data-paragraphe-id="${paragrapheId}-1">roses<div class="inat-vegetal-tooltip"><img src="" alt="Rosa"/></div></span>, de
<span class="inat-vegetal" data-taxon-name="Tulipa" data-paragraphe-id="${paragrapheId}-2">tulipes<div class="inat-vegetal-tooltip"><img src="" alt="Tulipa"/></div></span> en fleurs et de
<span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="${paragrapheId}-3">cerisiers<div class="inat-vegetal-tooltip"><img src="" alt="Quercus"/></div></span> majestueux."
}
(Real examples should ideally be longer, with various plant names correctly identified and formatted.)
        `
      },
      userRole: {
        role: "user",
        content: `voici le texte dans lequel tu dois faire ce qui t es demandé : ${article}`
      }
    }
  }

}
