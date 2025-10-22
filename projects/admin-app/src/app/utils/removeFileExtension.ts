/**
 * Supprime l'extension d'un nom de fichier
 * @param filename - Nom du fichier avec extension
 * @returns Nom du fichier sans extension
 */
export function removeFileExtension(filename: string): string {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  
  return filename.substring(0, lastDotIndex);
}
