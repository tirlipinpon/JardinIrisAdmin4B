import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { VERSION } from './app/shared/version';

// Expose la version dans window pour le debug
if (typeof window !== 'undefined') {
  (window as any).appVersion = VERSION;
}
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
