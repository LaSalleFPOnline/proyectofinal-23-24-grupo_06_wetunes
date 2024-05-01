import { Component, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule} from '@ionic/angular';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RegistroPage } from './registro/registro.page';
import { LoginPage } from './login/login.page';
import { CommonModule } from '@angular/common';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [ 
    IonRouterOutlet, 
    IonicModule, 
    RouterLink, 
    HttpClientModule, 
    RegistroPage, 
    LoginPage, 
    CommonModule],
})
export class AppComponent {
  isLoginPage: boolean = false; // Variable para controlar la visibilidad del split-pane
  constructor(private http: HttpClient, private router: Router, public platform: Platform) {
    // Escucha los cambios de navegación para determinar si está en la página de login

  }
}
