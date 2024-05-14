import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { UserInterface } from '../interfaces/user.interface';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UserProfilePage implements OnInit {
  usuario?: UserInterface;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getAuthState();
    if (currentUser) {
      this.firestoreService.retrieveUser(currentUser.uid).then(userData => {
        this.usuario = {
          email: currentUser.email ?? '',
          nombre: userData.nombre ?? 'Nombre no disponible',
          playlistId: userData.playlistId,
          sessionId: userData.sessionId
        };
      }).catch(error => {
        console.error("Error fetching user data:", error);
      });
    }
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            if (this.usuario?.email && data.newPassword) {
              this.authService.updateUserPassword(data.newPassword).subscribe({
                next: () => {
                  this.showToast('Password updated successfully');
                },
                error: (err) => {
                  this.showToast(`Error updating password: ${err.message || 'Unknown error'}`);
                  console.error('Error updating password', err);
                }
              });
            } else {
              this.showToast('Email or new password is missing');
              console.error('Email or new password is missing');
            }
          }
        }
      ]
    });

    await alert.present();
  }


  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  goToPlaylists() {
    this.router.navigateByUrl('/playlist');
  }
}
