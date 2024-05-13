import { Component, OnInit, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule} from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RegistroPage } from './registro/registro.page';
import { LoginPage } from './login/login.page';
import { CommonModule } from '@angular/common';
import { SplitPaneService } from '../app/services/split-pane.service';
import { AuthService } from './services/auth.service';

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
    CommonModule,
    ],
})
export class AppComponent implements OnInit{

  constructor( 
    private router: Router, 
    public splitPaneService: SplitPaneService,
    private authService: AuthService
  ) {

  }

  ngOnInit(){   
    console.log("App lanzada")
  }

  logout(){
    this.splitPaneService.splitPaneState = false;
    if (this.splitPaneService.splitPaneState === false){
      this.authService.logout().subscribe({
        next: () => {
          window.location.href = '/'; // Redirección a pagina de Login y refresca la pagina.
          // this.router.navigateByUrl('/');
          console.log("Logout success");
        
        },
        error: (error) => {
          console.log('Logout failed', error);
        }
      });
    } else console.log(this.splitPaneService.splitPaneState)
    
  }


}
