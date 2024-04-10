import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { routes } from "./app.routes";
import { provideHttpClient } from "@angular/common/http";

const firebaseConfig = {
    apiKey: "AIzaSyCzMMylndpS5f4etO6dg1Gxq0d9nCexlzo",
    authDomain: "wetunes-54fc9.firebaseapp.com",
    databaseURL: "https://wetunes-54fc9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wetunes-54fc9",
    storageBucket: "wetunes-54fc9.appspot.com",
    messagingSenderId: "138618419577",
    appId: "1:138618419577:web:68bcd44a0a76ba95c257a8",
    measurementId: "G-JFBTQ5W11R"
  };

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), provideHttpClient(),
        importProvidersFrom([
            provideFirebaseApp(() => initializeApp(firebaseConfig)),
            provideAuth(() => getAuth())
        ])
    ],
}