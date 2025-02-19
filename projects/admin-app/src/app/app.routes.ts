import { Routes } from '@angular/router';
import {authenticationRoutes} from "./features/authentication/authentication.routes";
import {userIsAuthenticateGuard} from "./features/authentication/guards/authenticate.guard";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: ()=> import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [userIsAuthenticateGuard]
  },
  {
    path: 'authenticate',
    children: authenticationRoutes
  },
  {
    path: '*',
    redirectTo: 'authenticate/login',
    pathMatch: 'full'
  }
];
