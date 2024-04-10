import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
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
    ) { }

regForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    passw: ['', Validators.required],
});

onSubmit(): void {
    const rawForm = this.regForm.getRawValue()
    this.authService.register(rawForm.email, rawForm.username, rawForm.passw)
    .subscribe(() => {
        this.router.navigateByUrl('/test-page');
    });
}




  ngOnInit() {
    const showPassword = false;
  }
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
