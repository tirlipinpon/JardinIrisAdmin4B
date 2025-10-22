/**
 * Convertit un texte en slug SEO-friendly
 * @param text Texte à convertir
 * @returns Slug en minuscules avec tirets (ex: "Jardinier taillant une haie" -> "jardinier-taillant-une-haie")
 */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalise les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement les lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+|-+$/g, ''); // Supprime les tirets au début/fin
}

