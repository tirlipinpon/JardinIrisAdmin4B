import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InsertInternalLinkService {
  titres = [
    "entretien-de-jardin",
    "creation-amenagement-de-jardin",
    "plantations",
    "taille-de-haie",
    "culture-potagere",
    "tonte-de-pelouse",
    "elagage-abatage-d-arbre",
    "travaux-de-terrassement",
  ];
  constructor() { }

  addLink(chapitreText: string): string {
    const titreAleatoire = this.titres[Math.floor(Math.random() * this.titres.length)];
    const lienHTML = `
    <a aria-label="service jardinier ${titreAleatoire.replace(/-/g, " ")} sur Bruxelles"
       href="https://www.jardin-iris.be/jardinier-paysagiste-service/${titreAleatoire}.html"
       class="theme-btn btn-one"
       style="width: 100%;margin: 35px;padding: 10px;background-color: #097e09;color: white;">
       Visitez le service ${titreAleatoire.replace(/-/g, " ")} que votre jardinier propose sur Bruxelles et ses environs.</a>
  `;
    return chapitreText + lienHTML;
  }
}
