import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Song, SongsService } from '../services/songs.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.html',
  styleUrls: ['./test-page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TestPagePage implements OnInit {

//Aquí simulamos mostrar las canciones

songs: Song[] = []

productsService = inject(SongsService);

  async ngOnInit() {
    const response = await this.productsService.getAll();
    this.songs = response.results;
  }

}
