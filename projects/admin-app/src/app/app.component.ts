import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {VersionsComponent} from "./features/versions/versions.component";
import {VersionService} from "./shared/versions/versions.service";

@Component({
    selector: 'app-root',
  imports: [RouterOutlet, VersionsComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private versionService: VersionService) {}

  ngOnInit(): void {
    // Affiche les infos de version dans la console au démarrage
    this.versionService.logToConsole();
    // Optionnel : ajouter le numéro de build au titre de la page
    this.versionService.setPageTitle();
  }
}
