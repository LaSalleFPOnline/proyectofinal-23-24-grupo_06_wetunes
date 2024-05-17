import { Injectable } from "@angular/core";
import { Auth, User, authState, signInWithEmailAndPassword, signOut, updatePassword } from "@angular/fire/auth";
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { Observable, from } from "rxjs";



@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private firebaseAuth: Auth) { }

  /**
   * Método que registra un nuevo usuario en Firebase Authentication utilizando un correo electrónico y una contraseña.
   * Despues actualiza su perfil para incluir un nombre de usuario.
   * @param email El correo electrónico del usuario para el registro.
   * @param username El nombre de usuario que se establecerá en el perfil del usuario.
   * @param passw La contraseña para la cuenta del usuario.
   * @returns Observable<void> que se completa después del registro y la actualización del perfil.
   */
  register(email: string, username: string, passw: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, passw)
      .then(response => updateProfile(response.user, { displayName: username }))
    return from(promise);
  }

  /**
   * Método que inicia sesión en Firebase Authentication utilizando un correo electrónico y una contraseña.
   * @param email El correo electrónico del usuario para iniciar sesión.
   * @param password La contraseña del usuario.
   * @returns Observable<void> que se completa cuando el usuario ha iniciado sesión.
   */
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => { })
    return from(promise);
  }

  /**
   * Método que cierra la sesión del usuario actual en Firebase Authentication.
   * @returns Observable<void> que se completa al cerrar la sesión del usuario.
   */
  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  /**
   * Método que envía un correo electrónico de recuperación de contraseña a la dirección de correo electrónico proporcionada.
   * Usando Firebase Authentication para gestionar el proceso de recuperación.
   * @param email El correo electrónico del usuario que necesita recuperar su contraseña.
   * @returns Observable<void> que emite un valor una vez que el correo de recuperación ha sido enviado.
   */
  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email)
      .then(() => console.log('Correo de recuperación enviado'))
      .catch((error) => console.error('Error enviando correo de recuperación', error));
    return from(promise);
  }

  /**
   * Métodoo que actualiza la contraseña del usuario actualmente autenticado.
   * @param newPassword La nueva contraseña que se desea establecer para el usuario.
   * @returns Observable<void> que se completa tras la actualización exitosa o fallida de la contraseña.
   */
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

  /**
   * Recupera el estado de autenticación actual del usuario, devolviendo el usuario si está autenticado.
   * @returns Retorna el objeto de usuario autenticado actual.
   * @throws Error si no hay un usuario autenticado.
   */
  getAuthState(): User {
    const user = this.firebaseAuth.currentUser
    console.log("Usuario", user);
    if (user)
      return user;
    else
      throw new Error('User not logged');
  }

  /**
   * @returns Observable que emite el estado de autenticación del usuario.
   */
  getAuthStateUser(): Observable<User | null> {
    return authState(this.firebaseAuth);
  }

  /**
   * Método que verifica si hay un usuario actualmente autenticado en Firebase.
   * @returns true si hay un usuario autenticado, de lo contrario retorna false.
   */
  getAuthLogin(): boolean {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
