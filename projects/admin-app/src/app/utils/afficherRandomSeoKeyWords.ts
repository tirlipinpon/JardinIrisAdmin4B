import {SeoKeyWords} from "../types/seo-key-words";

export function afficherRandomSeoKeyWords(): string {
  const values = Object.values(SeoKeyWords);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}
