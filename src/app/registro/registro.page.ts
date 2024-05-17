import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { UserInterface } from '../interfaces/user.interface';
import { AppComponent } from '../app.component';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule, HttpClientModule]
})
export class RegistroPage implements OnInit {
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private appComponent: AppComponent
  ) { }

  regForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  ngOnInit() {
    this.showPassword = false;
  }

  /**
   * Procesa el formulario de registro del usuario. Si el formulario es válido, extrae los datos, crea un objeto usuario,
   * y utiliza authService para registrar el usuario.
   */
  async onSubmit() {
    if (this.regForm.valid) {
      const rawForm = this.regForm.getRawValue();
      const usuario: UserInterface = {
        nombre: rawForm.nombre,
        email: rawForm.email,
        playlistId: '',
        sessionId: ''
      };
      this.authService.register(rawForm.email, rawForm.nombre, rawForm.password)
        .subscribe({
          next: async () => {
            this.router.navigateByUrl('/search-page');
            const user = this.authService.getAuthState()
            this.appComponent.loadUserData(user.uid);
            await this.firestoreService.addUser(usuario, user.uid);
          },
          error: (err) => {
            this.errorMessage = err.code;
            console.log(this.errorMessage);
          }
        });

    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
