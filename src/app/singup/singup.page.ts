import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SingupPage implements OnInit {

user: any;
emailError: any;
showPassword: any;

constructor(private router: Router) { }

ngOnInit() {
}

togglePassword() {
  this.showPassword = !this.showPassword;
}

singUp() {

  if (!this.validateEmail(this.user.email)) {
    this.emailError = true;
  } else {
    this.emailError = false;
    // Navigate only if the email is valid
    /*   this.fireAuth.createUserWithEmailAndPassword(this.email, this.password)
  .then(res => {
      this.router.navigate(['./login']);
  })
  .catch(error => {
      this.email="";
      this.password="";
  }) */
    this.router.navigate(['/home']);
  }


}

validateEmail(email: string): boolean {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


}
