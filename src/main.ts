import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth())
  ]), importProvidersFrom(provideFirebaseApp(() => 
    initializeApp({
      "projectId":"wetunes-54fc9",
      "appId":"1:138618419577:web:68bcd44a0a76ba95c257a8",
      "databaseURL":"https://wetunes-54fc9-default-rtdb.europe-west1.firebasedatabase.app",
      "storageBucket":"wetunes-54fc9.appspot.com","apiKey":"AIzaSyCzMMylndpS5f4etO6dg1Gxq0d9nCexlzo",
      "authDomain":"wetunes-54fc9.firebaseapp.com",
      "messagingSenderId":"138618419577",
      "measurementId":"G-JFBTQ5W11R"}))),
    importProvidersFrom(provideFirestore(() => getFirestore()))
  ],
});
