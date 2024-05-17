import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-tvmode',
  templateUrl: './tvmode.page.html',
  styleUrls: ['./tvmode.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TvmodePage implements OnInit {
  artistName: string = ''; // Variable vinculada al formulario
  artist: string | null = null; // Aquí se mostrará el nombre del artista
  tracks: any[] = []; // Aquí almacenaremos las canciones
  artistSelected: string = '';
  trackName: string = '';


  constructor(
    private spotifyService: SpotifyService,
    public toastController: ToastController,
    public activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const artistSelected = this.activatedRoute.snapshot.paramMap.get('artistSelected');
    const trackId = this.activatedRoute.snapshot.paramMap.get('trackId');

    if (artistSelected && trackId) {
      this.artistName = artistSelected;
      this.trackName = trackId;
    }

    this.getArtistDetails(this.artistName);
  }

  /**
   * Obtiene detalles del artista especificado a través del nombre del artista utilizando la API de Spotify.
   * Si encuentra al artista, procede a obtener las pistas más populares de dicho artista.
   * @param artistName El nombre del artista a buscar.
   */
  getArtistDetails(artistName: string) {
    this.spotifyService.getAccessToken().subscribe({
      next: tokenData => {
        this.spotifyService.searchArtist(artistName, tokenData.access_token).subscribe({
          next: data => {
            this.artist = data.artists.items[0]?.name || 'Artist not found';
            if (this.artist !== 'Artist not found') {
              this.getArtistTracks(data.artists.items[0].id, tokenData.access_token);
            }
          },
          error: error => console.error('Error fetching artist details:', error)
        });
      },
      error: error => console.error('Error obtaining access token:', error)
    });
  }

  /**
  * Solicita y recupera las pistas más populares de un artista específico usando su ID y un token de acceso.
  * @param artistId El identificador único del artista en Spotify.
  * @param accessToken El token de acceso necesario para autenticar la solicitud en la API de Spotify.
  */
  private getArtistTracks(artistId: string, token: string) {
    this.spotifyService.getArtistTracks(artistId, token).subscribe({
      next: data => {
        this.tracks = data.tracks;
      },
      error: error => console.error('Error fetching tracks:', error)
    });
  }
}
