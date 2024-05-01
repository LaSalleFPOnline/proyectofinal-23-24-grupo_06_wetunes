import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) 
  },
  { 
    path: 'login', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) 
  },

  {
    path: 'search-page',
    loadComponent: () => import('./search-page/search-page.page').then( m => m.TestPagePage)
  },
  {
    path: 'session',
    loadComponent: () => import('./session/session.page').then( m => m.SessionPage)
  },
  {
    path: 'register', loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'tvmode/:artistSelected/:trackId',
    loadComponent: () => import('./tvmode/tvmode.page').then( m => m.TvmodePage)
  }
];
