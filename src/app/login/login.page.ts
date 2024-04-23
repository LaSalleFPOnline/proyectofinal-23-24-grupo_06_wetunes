import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  public email: any;
  public password: any;

  user = { email: '', password: '' };
  emailError = false;
  showPassword = false;

  constructor(public fireAuth: AngularFireAuth, public router: Router, public toastController: ToastController) { }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {

    if (!this.validateEmail(this.user.email) && !this.validatePassword(this.user.password)) {
      this.emailError = true;
    } else {
      this.emailError = false;
      // Navigate only if the email is valid

      this.fireAuth.signInWithEmailAndPassword(this.email, this.password)
      .then(async res => {
        
        let nombreUsur: string = this.email.split('@')[0]; //Separamos el nombre del usuario del mail
        localStorage.setItem('usuario', nombreUsur); //Guardamos el nombre del usuario en el Storage para poderlo usar desde otras pages

        this.router.navigate(['./home/'+ nombreUsur]); //Lo añadimos a la url configurando tambien el app-routing

    })
    .catch(async error => {
        this.email="";
        this.password="";

        const toast = await this.toastController.create({
          message: "Email o Password no validos",
          duration: 3000,
          position: 'top'
        })
        toast.present();
    })





      this.router.navigate(['home']);
    }
  }

  validateEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  validatePassword(password: string): boolean{

    if(password.length > 6){
      return true;
    }else{
      return false;
    }
    
  }
}
