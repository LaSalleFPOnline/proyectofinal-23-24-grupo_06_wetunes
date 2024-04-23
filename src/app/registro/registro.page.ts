import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../services/firestore.service';
import { UserInterface } from '../user.interface';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule, HttpClientModule]
})
export class RegistroPage implements OnInit {
    constructor(
        private fb: FormBuilder, 
        private router: Router, 
        private authService: AuthService,
        private http : HttpClient,
        private firestoreService: FirestoreService
    ) { }

regForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
});

errorMessage: string | null = null;

async onSubmit() {
  if(this.regForm.valid){
    const rawForm = this.regForm.getRawValue();
    const usuario: UserInterface = {
      nombre: rawForm.nombre,
      email: rawForm.email,
      password: rawForm.password,
    };
    this.authService.register(rawForm.email, rawForm.nombre, rawForm.password)
    .subscribe({
      next: async () => {
        this.router.navigateByUrl('/test-page');
        const response = await this.firestoreService.addUser(usuario);
        console.log(response);
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(this.errorMessage);
      }
    });
    
  } 
}

  ngOnInit() {
    const showPassword = false;
  }
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
