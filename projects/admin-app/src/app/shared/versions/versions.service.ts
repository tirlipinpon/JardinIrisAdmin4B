import { Injectable } from '@angular/core';
import {VERSION} from "../version";


@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly versionInfo = VERSION;

  getBuildNumber(): string {
    return this.versionInfo.buildNumber;
  }

  getBuildDate(): string {
    return this.versionInfo.buildDate;
  }

  getBuildTimestamp(): number {
    return this.versionInfo.buildTimestamp;
  }

  getFullVersionInfo() {
    return { ...this.versionInfo };
  }

  // Afficher dans la console
  logToConsole(): void {
    console.group('🔧 Version Info');
    console.log('Build Number:', this.versionInfo.buildNumber);
    console.log('Build Date:', new Date(this.versionInfo.buildDate).toLocaleString());
    console.log('Timestamp:', this.versionInfo.buildTimestamp);
    console.groupEnd();
  }

  // Afficher dans le titre de la page
  setPageTitle(): void {
    document.title = `${document.title} - Build #${this.versionInfo.buildNumber}`;
  }
}
