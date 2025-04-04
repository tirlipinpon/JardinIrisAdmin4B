import { Routes } from '@angular/router';
import {authenticationRoutes} from "./features/authentication/authentication.routes";
import {userIsAuthenticateGuard} from "./features/authentication/guards/authenticate.guard";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/login',
    pathMatch: 'full'
  },
  {
    path: 'home/login',
    loadComponent: ()=> import('./pages/home/home.component').then(m => m.HomeComponent),
    // canActivate: [userIsAuthenticateGuard]
  },
  {
    path: 'home',
   children: authenticationRoutes
  },
  {
    path: '*',
    redirectTo: 'home/login',
    pathMatch: 'full'
  }
];
