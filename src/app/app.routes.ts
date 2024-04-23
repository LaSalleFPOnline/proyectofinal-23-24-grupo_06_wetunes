import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) },
  { path: 'login', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) },
  {
    path: 'test-page',
    loadComponent: () => import('./test-page/test-page').then( m => m.TestPagePage)
  },
  {
    path: 'singup',
    loadComponent: () => import('./singup/singup.page').then( m => m.SingupPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  }
];
