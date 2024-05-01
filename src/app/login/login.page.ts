import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule, HttpClientModule]
})
export class LoginPage implements OnInit {
  showPassword = false;

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  logForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(authService: AuthService) { }

  ngOnInit() {
    const showPassword = false;
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  errorMessage: string | null = null;
  onSubmit(): void {
    const rawForm = this.logForm.getRawValue();
    this.authService
    .login(rawForm.email, rawForm.password)
    .subscribe({
      next: () => {
        this.router.navigateByUrl('/test-page');
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(this.errorMessage);
      },
    });
  }

}
