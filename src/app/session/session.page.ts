import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { SessionInterface } from '../interfaces/session.interface';

@Component({
  selector: 'app-session-page',  // Selector del componente para uso en HTML
  templateUrl: './session.page.html',  // Ruta al archivo de plantilla del componente
  styleUrls: ['./session.page.scss'],  // Ruta al archivo de estilos CSS del componente
  standalone: true,  // Habilita el modo independiente, no requiere un módulo para agrupar
  imports: [IonicModule, CommonModule, FormsModule]  // Importa módulos necesarios para la plantilla
})
export class SessionPage implements OnInit {
  sessionId: string = '';  // Almacena el ID de la sesión actual
  isInSession: boolean = false;  // Estado para saber si el usuario está en una sesión
  isSessionAdmin: boolean = false;  // Estado para saber si el usuario es el administrador de la sesión

  constructor(
    public toastController: ToastController,  // Servicio de Ionic para mostrar notificaciones
    public authService: AuthService,  // Servicio para manejar la autenticación
    public fireStoreService: FirestoreService  // Servicio para interactuar con Firestore
  ) { }

  ngOnInit() {
    this.checkSessionStatus();  // Verifica el estado de la sesión al iniciar el componente
  }

  // Verifica si el usuario está en una sesión y si es administrador de la misma
  async checkSessionStatus(): Promise<void> {
    const userId = this.authService.getAuthState().uid;  // Obtiene el UID del usuario autenticado
    const user = await this.fireStoreService.retrieveUser(userId);  // Recupera los datos del usuario
    if (user.sessionId != '') {
      this.sessionId = user.sessionId;
      this.isInSession = true;
      const session = await this.fireStoreService.retrieveSession(user.sessionId);  // Recupera los datos de la sesión
      if (session.adminUserId == userId) {
        this.isSessionAdmin = true;  // Establece al usuario como administrador si coincide con el ID en la sesión
      }
    }
  }

  // Genera una cadena aleatoria de 5 caracteres para usar como ID de sesión
  generateRandomString(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // Crea una nueva sesión y actualiza el estado del usuario
  async createNewSession(): Promise<void> {
    console.log('Creating new session...');
    const sessionId = this.generateRandomString();  // Genera un nuevo ID de sesión
    const userId = this.authService.getAuthState().uid;
    const userPlaylistId = await this.fireStoreService.getUserPlaylistId(userId);  // Obtiene el ID de la lista de reproducción del usuario

    if (userPlaylistId) {
      const newSession: SessionInterface = {
        playlistId: userPlaylistId,
        adminUserId: userId  // Asigna al usuario como administrador de la sesión
      };

      await this.fireStoreService.addSession(newSession, sessionId);  // Añade la nueva sesión a Firestore
      await this.fireStoreService.updateUserSessionId(userId, sessionId);  // Actualiza el ID de sesión del usuario en Firestore
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

  // Salida de una sesión existente y actualización del estado del usuario
  async exitExistingSession() {
    const userId = this.authService.getAuthState().uid;
    await this.fireStoreService.updateUserSessionId(userId, "");  // Elimina el ID de sesión del usuario en Firestore
    this.sessionId = '';
    this.isInSession = false;
    this.isSessionAdmin = false;
    const toast = await this.toastController.create({
      message: 'Te has salido de la sesión correctamente!',
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  // Elimina la sesión actual y actualiza el estado del usuario
  async removeAndExitSession() {
    await this.fireStoreService.clearSessionId(this.sessionId);  // Elimina la sesión de Firestore
    this.sessionId = '';
    this.isInSession = false;
    this.isSessionAdmin = false;
    const toast = await this.toastController.create({
      message: 'Te has salido de la sesión y ha sido borrada correctamente!',
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  // Permite al usuario unirse a una sesión existente usando un ID de sesión proporcionado
  async joinExistingSession(): Promise<void> {
    console.log(`Joining session with ID: ${this.sessionId}`);
    const userId = this.authService.getAuthState().uid;
    if (await this.fireStoreService.checkSession(this.sessionId)) {  // Comprueba si la sesión existe en Firestore
      await this.fireStoreService.updateUserSessionId(userId, this.sessionId);  // Actualiza el ID de sesión del usuario en Firestore
      const toast = await this.toastController.create({
        message: 'Te has unido a la sesión correctamente!',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
      this.isInSession = true;
    } else {
      const toast = await this.toastController.create({
        message: 'Ese código de sesión no parece ser válido!',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    }
  }
}
