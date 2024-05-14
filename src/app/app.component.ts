import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule} from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RegistroPage } from './registro/registro.page';
import { LoginPage } from './login/login.page';
import { CommonModule } from '@angular/common';
import { SplitPaneService } from '../app/services/split-pane.service';
import { AuthService } from './services/auth.service';
import { FirestoreService } from './services/firestore.service';
import { UserInterface } from './interfaces/user.interface';
import { Subscription } from 'rxjs';

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

  usuario?: UserInterface;
  authSubscription?: Subscription;

  constructor(
    private router: Router,
    private firestoreService: FirestoreService,
    public splitPaneService: SplitPaneService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(){
    console.log("App lanzada")
    this.authSubscription = this.authService.getAuthStateUser().subscribe(currentUser => {
      if (currentUser) {
        console.log('Usuario autenticado:', currentUser); // Añadido para verificar que el usuario está autenticado
        this.firestoreService.retrieveUser(currentUser.uid).then(userData => {
          this.usuario = {
            email: currentUser.email ?? '',
            nombre: userData.nombre ?? 'Nombre no disponible',
            playlistId: userData.playlistId,
            sessionId: userData.sessionId
          };
          console.log('Datos del usuario cargados:', this.usuario); // Añadido para verificar que los datos del usuario se han cargado
          this.cdr.detectChanges(); // Forzar la detección de cambios
        }).catch(error => {
          console.error("Error fetching user data:", error);
        });
      } else {
        console.error('No user logged in');
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
