export function extractChapitreById(article: string, chapitreId: number): string {
  const regex = new RegExp(`<span id="paragraphe-${chapitreId}">.*?<p>(.*?)<\/p>`, 's');
  const match = article.match(regex);
  return match?.[1] ?? '';
}
export function replaceChapitreById(article: string, chapitreId: number, newContent: string): string {
  const regex = new RegExp(`(<span id="${'paragraphe-' + chapitreId}"><p>)(.*?)(</p></span>)`, 's');
  if (!regex.test(article)) {
    return article; // Retourne l'article inchangé si le bloc n'est pas trouvé
  }
  return article.replace(regex, `$1${newContent}$3`);
}

