import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) },
  {
    path: 'test-page',
    loadComponent: () => import('./test-page/test-page.page').then( m => m.TestPagePage)
  }
];
