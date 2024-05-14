import { Injectable } from "@angular/core";
import { Auth, User, authState, sendEmailVerification, signInWithEmailAndPassword, signOut, updatePassword } from "@angular/fire/auth";
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { Observable, catchError, from, map } from "rxjs";
import { updateEmail } from "firebase/auth";
import { FirestoreService } from "./firestore.service";



@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private firebaseAuth: Auth, private firestoreService: FirestoreService ) { }

    register(email: string, username: string, passw: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, passw)
            .then(response => updateProfile(response.user, { displayName: username }))

        return from(promise);
    }

    login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
            .then(() => { })
        return from(promise);
    }

    getAuthState(): User {
        const user = this.firebaseAuth.currentUser
        console.log("Usuario", user);
        if (user)
            return user;
        else
            throw new Error('User not logged');
    }

    getAuthStateUser(): Observable<User | null> {
      return authState(this.firebaseAuth);
  }

    getAuthLogin(): boolean{
        const user = this.firebaseAuth.currentUser;
        if(user){
            return true;
        }else {
            return false;
        }
    }

    logout(): Observable<void>{
        const promise = signOut(this.firebaseAuth);
        return from(promise);
    }

    resetPassword(email: string): Observable<void> {
      const promise = sendPasswordResetEmail(this.firebaseAuth, email)
          .then(() => console.log('Correo de recuperación enviado'))
          .catch((error) => console.error('Error enviando correo de recuperación', error));

      return from(promise);
  }

  updateUserPassword(newPassword: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const promise = updatePassword(user, newPassword).then(() => {
        console.log('Password updated successfully');
      }).catch((error) => {
        console.error('Error updating password', error);
        throw error;
      });

      return from(promise);
    } else {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }
  }


}
