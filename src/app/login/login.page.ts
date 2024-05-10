import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  showPassword = false

  logForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    const showPassword = false;
  }

  /**
   * Este metodo obtiene los valores del formulario y los pasa como parametros al metodo 'login()' de 'authService'.
   * En caso de una autenticación exitosa se redirige al usuario a la pagina principal de la aplicación.
   * Si ocurre un error se muestra un 'toast' con el mensaje de error.
   */
  onSubmit(): void {
    const rawForm = this.logForm.getRawValue();
    this.authService
      .login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/search-page');
        },
        error: (err) => {
          let errorMessage = 'Ha ocurrido un error, inténtalo de nuevo.';
          if (err.code === 'auth/invalid-credential') {
            errorMessage = 'El correo o la contraseña son incorrectos';
          } else if (err.code === 'auth/invalid-email') {
            errorMessage = 'El formato del correo electrónico es incorrecto';
          }
          this.presentToast(errorMessage);
          console.log(err);
        },
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
