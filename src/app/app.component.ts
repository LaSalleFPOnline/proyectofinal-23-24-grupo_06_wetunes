import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RegistroPage } from './registro/registro.page';
import { LoginPage } from './login/login.page';
import { CommonModule } from '@angular/common';
import { SplitPaneService } from '../app/services/split-pane.service';
import { AuthService } from './services/auth.service';
import { UserInterface } from './interfaces/user.interface';
import { Subscription } from 'rxjs';
import { FirestoreService } from './services/firestore.service';

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
    public splitPaneService: SplitPaneService,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(){
    console.log("App lanzada")
    this.authSubscription = this.authService.getAuthStateUser().subscribe(currentUser => {
      if (currentUser) {
        console.log('Usuario autenticado:', currentUser);
        this.loadUserData(currentUser.uid);
      } else {
        console.error('No user logged in');
      }
    });
  }

  /**
   * Método para cargar los datos del usuario desde Firestore.
   * @param uid El ID del usuario cuya información se desea cargar.
   */
  loadUserData(uid: string) {
    this.firestoreService.retrieveUser(uid).then(userData => {
      this.usuario = {
        email: userData.email ?? '',
        nombre: userData.nombre ?? 'Nombre no disponible',
        playlistId: userData.playlistId,
        sessionId: userData.sessionId
      };
      console.log('Datos del usuario cargados:', this.usuario);
      this.cdr.detectChanges();
    }).catch(error => {
      console.error("Error fetching user data:", error);
    });
  }

/**
 * Método para cerrar la sesión del usuario.
 * Establece el estado de la división del panel en falso y luego cierra la sesión del usuario utilizando el servicio de autenticación.
 */
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
