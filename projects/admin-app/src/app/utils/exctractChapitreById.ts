export function extractChapitreById(text: string, id: number): string {
  const regex = new RegExp(`<span id="paragraphe-${id}">.*?<article>(.*?)<\/article>`, "s");
  // console.log("Test regex sur extract Chapitre By Id : ", regex.test(text));
  const match = text.match(regex);
  return match ? match[1] : text;
}
export function replaceChapitreById(text: string, chapitreId: number, newContent: string): string {
  const regex = new RegExp(`(<span id="paragraphe-${chapitreId}">.*?<article>)(.*?)(</article>)`, "s");
  // console.log("Regex construite : ", regex);
  // console.log("Test regex sur replace Chapitre By Id : ", regex.test(text));
  return text.replace(regex, `$1${newContent}$3`);
}

