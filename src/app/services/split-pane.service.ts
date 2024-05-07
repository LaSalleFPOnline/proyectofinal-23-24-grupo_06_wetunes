import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SplitPaneService {

  public splitPaneState: boolean | undefined;

  constructor(public platform: Platform) {
    this.splitPaneState = false;
   }

   getSplitPane(){
    if(localStorage.getItem('userData')){ //Si tenemos userData significa que estamos en cualquiera menos la de login
      if(this.platform.width() > 850){ //Ya que si es menor no queremos que se muestre pq queremos el menú hamburguesa
        this.splitPaneState = true;
      } else {
        this.splitPaneState = false;
      }
    }
    return this.splitPaneState;
  }

}
