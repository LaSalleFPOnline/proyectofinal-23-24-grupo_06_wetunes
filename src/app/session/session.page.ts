import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { SessionInterface } from '../interfaces/session.interface';

@Component({
  selector: 'app-session-page',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SessionPage implements OnInit {
  sessionId: string = '';
  isInSession: boolean = false;
  isSessionAdmin: boolean = false;

  constructor(private http: HttpClient, public toastController: ToastController, public authService: AuthService, public fireStoreService: FirestoreService) { }

  ngOnInit() { 
    this.checkSessionStatus();
  }

  async checkSessionStatus(): Promise<void> {
    const userId = this.authService.getAuthState().uid;
    const user = await this.fireStoreService.retrieveUser(userId);
    if(user.sessionId != ''){
      this.sessionId = user.sessionId;
      this.isInSession = true;
      const session = await this.fireStoreService.retrieveSession(user.sessionId);
      if(session.adminUserId == userId) {
        this.isSessionAdmin = true;
      }
    }
  }

  generateRandomString(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async createNewSession(): Promise<void> {
    console.log('Creating new session...');
    /**
     * 1- Generar codigo sesion 5 chars alphanumeric
     * 2- Insertar nuevo objeto Session en firebase (indicando como clave, el codigo, y como playlistId mi propia playlist)
     *    2.1- Comprobar que tengo una playlist ya (al menos una canción)
     * 3- Una vez insertada la Session, actualizar mi usuario en firebase y ponerle el sessionId
     * 
     */

    const sessionId = this.generateRandomString();
    const userId = this.authService.getAuthState().uid;
    const userPlaylistId = await this.fireStoreService.getUserPlaylistId(userId);

    if (userPlaylistId) {
      const newSession: SessionInterface = {
        playlistId: userPlaylistId,
        adminUserId: userId
      };

      await this.fireStoreService.addSession(newSession, sessionId);
      await this.fireStoreService.updateUserSessionId(userId, sessionId);

      const toast = await this.toastController.create({
        message: 'Sesión creada correctamente!',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();

      this.isInSession = true;
      this.sessionId = sessionId;
      this.isSessionAdmin = true;
    } else {
      throw new Error("No tienes una playlist aún. Añade una canción al menos.")
    }
  }

  async exitExistingSession() {
    const userId = this.authService.getAuthState().uid;
    await this.fireStoreService.updateUserSessionId(userId, "");
    this.sessionId = '';
    this.isInSession = false;
    this.isSessionAdmin = false;
    const toast = await this.toastController.create({
      message: 'Te has salido de la sesión correctamente!',
      duration: 2000,
      position: 'bottom',
    });
  }

  async removeAndExitSession(){
    await this.fireStoreService.clearSessionId(this.sessionId);
    this.sessionId = '';
    this.isInSession = false;
    this.isSessionAdmin = false;
    const toast = await this.toastController.create({
      message: 'Te has salido de la sesión y ha sido borrada correctamente!',
      duration: 2000,
      position: 'bottom',
    });
  }

  async joinExistingSession(): Promise<void> {
    console.log(`Joining session with ID: ${this.sessionId}`);
    /**
     * Para unirnos a una sesión lo unico que debemos asegurarnos es que
     * el codigo proporcionado sea correcto y, si lo es, pa dentro
     */
    const userId = this.authService.getAuthState().uid;
    if (await this.fireStoreService.checkSession(this.sessionId)) {
      // Existe la sesion, por lo tanto la ponemos
      await this.fireStoreService.updateUserSessionId(userId, this.sessionId);
      const toast = await this.toastController.create({
        message: 'Te has unido a la sesión correctamente!',
        duration: 2000,
        position: 'bottom',
      });
      this.isInSession = true;
    } else {
      // En caso contrario, mostramos toast de error
      const toast = await this.toastController.create({
        message: 'Ese código de sesión no parece ser válido!',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    }
  }

}
