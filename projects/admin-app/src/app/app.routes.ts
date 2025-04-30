import { Routes } from '@angular/router';
import {authenticationRoutes} from "./features/authentication/authentication.routes";
import {userIsAuthenticateGuard} from "./features/authentication/guards/authenticate.guard";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'authenticate/login',
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
    path: 'home/edit/:id',
    loadComponent: () => import('../app/features/edit/edit.component').then(m => m.EditComponent)
  },
  {
    path: 'home/all',
    loadComponent: () => import('../app/features/all/all.component').then(m => m.AllComponent)
  }

];
