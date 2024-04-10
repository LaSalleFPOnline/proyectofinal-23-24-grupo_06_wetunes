import { Component, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RegistroPage } from './registro/registro.page';
import { LoginPage } from './login/login.page';
import { CommonModule } from '@angular/common';

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
  constructor(private http: HttpClient) {}
}
