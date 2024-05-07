import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', loadComponent: ()=> import('./login/login.page').then(m => m.LoginPage) 
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'playlist',
    loadComponent: () => import('./playlist/playlist.page').then( m => m.PlaylistPage)
  },
  {
    path: 'session',
    loadComponent: () => import('./session/session.page').then( m => m.SessionPage)
  },
  {
    path: 'register', loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  }
];
