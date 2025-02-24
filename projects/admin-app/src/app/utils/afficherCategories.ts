import {CathegoriesBlog} from "../features/searchBar/store";


export function afficherCategories(charactereJoin: string): string {
  // On récupère les valeurs de l'enum sous forme de tableau
  return Object.values(CathegoriesBlog).join(charactereJoin);
}
