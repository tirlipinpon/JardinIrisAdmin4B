export function extractJSONBlock(input: any): string {
  const regex = /```json\s([\s\S]*?)\s```/i
  const match = input.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return input; // Si aucun bloc JSON trouvé,
}

export function extractHTMLBlock(input: string): string {
  const regex = /```html\s([\s\S]*?)\s```/;
  const match = input.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return input; // Si aucun bloc JSON trouvé,
}

export function  parseJsonSafe(jsonString: string | null): any | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON string:', jsonString);
    return null;
  }
}

export function extractSecondSpanContent(htmlString: string, chapitreId: number): string {
  // Expression régulière pour capturer le contenu de <span> avec l'id correspondant
  const spanMatches = htmlString.match(new RegExp(`<span id=['"]paragraphe-${chapitreId}['"]>(.*?)<\/span>`, 's'));
  // Si une correspondance est trouvée, retourne le contenu sans les balises
  if (spanMatches && spanMatches.length >= 2) {
    return spanMatches[1].trim();
  } else {
    return ''; // Retourne une chaîne vide si aucune correspondance n'est trouvée
  }
}
export function extractByPositionH4Title(texte: string, x: number): string {
  console.log(`Extraction du titre H4 du paragraphe ${x} (longueur de l'article : ${texte?.length || 0} caractères)`);
  const regex = new RegExp(`<span[^>]*id=["']paragraphe-${x}["'][^>]*>\\s*<h4>(.*?)</h4>`, 'si');
  return texte.match(regex)?.[1] ?? '';
}
