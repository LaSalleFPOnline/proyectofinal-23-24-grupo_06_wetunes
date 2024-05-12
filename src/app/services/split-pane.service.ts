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

   getSplitPane(){
    if(this.authService.getAuthLogin()){ //Si tenemos usuario significa que estamos en cualquier pagina menos la de login
      if(this.platform.width() > 850){ //Ya que si es menor no queremos que se muestre pq queremos el menú hamburguesa
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
