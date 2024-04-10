import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  logForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    passw: ['', Validators.required],
  });

  constructor() { }

  ngOnInit() {
    const showPassword = false;
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    console.log('Login');
  }

}
