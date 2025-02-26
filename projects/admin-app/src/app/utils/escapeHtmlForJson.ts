export function escapeHtmlForJson(html: string): string {
  const test =  html
    .replace(/\\/g, '\\\\')  // Échappe les backslashes
    .replace(/"/g, '\\"')     // Échappe les guillemets doubles
    // .replace(/'/g, "\\'")     // Échappe les guillemets simples
    // .replace(/’/g, "\\’")     // Échappe les apostrophes
    // .replace(/\n/g, '\\n')    // Échappe les sauts de ligne
    .replace(/\r/g, '\\r')    // Échappe les retours chariot
    .replace(/\t/g, '\\t');   // Échappe les tabulations
  return test;
}
