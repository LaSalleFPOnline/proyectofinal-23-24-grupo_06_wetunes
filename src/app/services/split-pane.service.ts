import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SplitPaneService {

  public splitPaneState: boolean | undefined;

  constructor(public platform: Platform, private authService: AuthService) {
    this.splitPaneState = false;
  }

  /**
   * Método que determina el estado de visibilidad del Split Pane (menú lateral) basado en el estado de autenticación del usuario 
   * y el ancho de la plataforma.
   * @returns boolean Indica si el Split Pane debe estar visible o no.
   */
  getSplitPane() {
    if (this.authService.getAuthLogin()) { //Si tenemos usuario significa que estamos en cualquier pagina menos la de login
      if (this.platform.width() > 850) { //Ya que si es menor no queremos que se muestre pq queremos el menú hamburguesa
        this.splitPaneState = true;
      } else {
        this.splitPaneState = false;
      }
    } else {
      this.splitPaneState = false;
    }
    return this.splitPaneState;
  }

}
