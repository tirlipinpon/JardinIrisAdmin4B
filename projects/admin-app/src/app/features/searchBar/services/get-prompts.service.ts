import { Injectable } from '@angular/core';
import {afficherCategories} from "../../../utils/afficherCategories";
import {formatCurrentDateUs} from "../../../utils/getFormattedDate";

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
Provide the enhanced blog segment in a valid JSON format as follows: {"upgradedChapitre": "Response upgraded chapitre..."} Ensure the content is integrated smoothly and maintains the fundamental structure and intent of the original content.

# Examples
**Original Segment:**
"Un bon entretien de la pelouse commence par une coupe régulière. Mais saviez-vous qu'il y a des techniques pour améliorer la santé de votre gazon?"

**Enhanced Segment:**
{"upgradedChapitre": "Un bon entretien de la pelouse commence par une coupe régulière. Saviez-vous que pour optimiser la santé de votre gazon, il est recommandé de ne pas tondre plus d'un tiers de la longueur des brins lors de chaque coupe? Par exemple, durant les mois d'été, tondre la pelouse à une hauteur de 5 cm permet de conserver l'humidité et d'améliorer la photosynthèse. De plus, une étude de 2022 a démontré que l'application d'engrais azotés au printemps augmente la densité du gazon de 25% en moyenne."}

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
     Ajoute au contenu des textes des paragraphes en insérant des balises HTML pour structurer le contenu et en améliorer la lisibilité, sans modifier le texte original.

- Respecte les étapes suivantes pour la mise en forme :

# Steps
- Dans chaque paragraphe, encadrer une phrase clé avec la balise \`<b>\` pour la mettre en évidence et attirer l'attention du lecteur.
- Ajoute d'un emoji illustrant le sujet du paragraphe à gauche de chaque titre.
- Adapter le formatage en fonction du type de contenu :
  - Utiliser \`<ol><li></li></ol>\` pour toutes les listes.
  - Utiliser la balise \`<u>\` pour souligner des informations spécifiques.
  - Utiliser \`<em>\` pour mettre en valeur des termes importants.
  - Mettre le contenu tabulaire dans des balises \`<table><tr><td></td></tr></table>\`.

# Output Format
Présente le résultat sous la forme d'un JSON valide structuré comme suit :
{
  "articleHtml": "<html_content_here>"
}


# Notes
- Le JSON ne doit contenir aucun autre texte ou structuration en dehors des balises HTML requises.
- S'assurer de la validité du code HTML généré, en suivant les instructions spécifiées pour chaque type de contenu.
      `},
      userRole: { "role": "user",
        "content": `Transforme le contenu des textes des paragraphes de ceci ${article}  en insérant des balises HTML pour structurer le contenu et en améliorer la lisibilité, sans modifier le texte original.` }
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
    const prompt = `Identifie le mot-clé unique le plus pertinent à partir du titre d'un blog pour effectuer une recherche d'image sur le site Unsplash.com.
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
    return prompt;
  }

  getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle: string, chapitreKeyWordList: string[]){
    const prompt = `Voici le titre: ${titreArticle}.
    Si la liste n'est pas vide : ( ${chapitreKeyWordList} ) , choisi un autre mot que ceux qui sont deja dans cette liste.`
    return prompt;
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
    const prompt = `Tu es une IA spécialisée dans l'analyse de textes et la sélection d'illustrations adaptées pour un blog de jardinier paysagiste.
            Ta tâche consiste à lire un texte.
            En analysant le contenu du texte, identifie les thèmes, le ton, et les éléments visuels ou concepts clés qui pourraient être illustrés.
            À partir d'une liste d'URL d'images, trouve celle qui représente le mieux le contenu de ce texte,
            en considérant l'aspect narratif et la cohérence avec le style du texte.`
    return prompt;
  }

  getPerplexityPromptUserSelectBestImageForChapitresInArticle(article: string, images: any){
    const prompt = `Voici le texte  : ${article}, ainsi qu'une liste d'URL d'images ${JSON.stringify(images)}.
            Analyse le contenu du texte pour en extraire les thèmes et concepts principaux, et choisis l'image la plus représentative de cette partie du texte destinée sur un blog de jardinier.
            Assure-toi que l'image sélectionnée illustre bien l'ambiance et les éléments visuels pertinents.
            Donne l'url de l'image choisie en suivant ce format JSON: {"imageUrl":"url"}`
    return prompt;
  }

}
