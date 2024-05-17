import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { SplitPaneService } from '../services/split-pane.service';

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
    public splitPaneService: SplitPaneService
  ) { }

  ngOnInit() {
    this.splitPaneService.getSplitPane();
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

  /**
   * Metodo que envía un enlace de restablecimiento de contraseña al email especificado en el formulario.
   */
  forgotPassword() {
    const emailControl = this.logForm.get('email');

    if (emailControl && emailControl.value) {
      this.authService.resetPassword(emailControl.value).subscribe({
        next: () => alert('Por favor revisa tu correo para restablecer tu contraseña.'),
        error: (error) => alert('Error enviando correo de recuperación: ' + error)
      });
    } else {
      alert('Por favor ingresa tu correo electrónico.');
    }
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
