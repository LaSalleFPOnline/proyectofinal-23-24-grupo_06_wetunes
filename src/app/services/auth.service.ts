import { Injectable } from "@angular/core";
import { Auth, signInWithEmailAndPassword } from "@angular/fire/auth";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Observable, from } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private firebaseAuth: Auth){}

    register(email: string, username: string, passw: string): Observable<void>{
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, passw)
        .then(response => updateProfile(response.user, {displayName: username}))

        return from(promise);
    }

    login(email: string, password: string): Observable<void>{
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
        .then(() => {})
        return from(promise);
    }

    getAuthState() {
        return this.firebaseAuth.currentUser;
      }
}