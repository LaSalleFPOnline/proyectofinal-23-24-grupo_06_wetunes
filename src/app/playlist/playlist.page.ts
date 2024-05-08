import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { SpotifyService } from '../services/spotify.service';
import { addIcons } from 'ionicons';
import { playOutline } from 'ionicons/icons';
import { stopOutline } from 'ionicons/icons';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PlaylistPage implements OnInit, AfterViewInit {

  playlistId: string | null = null
  tracks: any[] = [];
  audio: HTMLMediaElement | null = null;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  currentTrackUrl: string | null = null;


  constructor(private http: HttpClient, public toastController: ToastController, public authService: AuthService, public fireStoreService: FirestoreService, private spotifyService: SpotifyService) {

  }


  ngOnInit() {
    this.loadPlaylist();
  }
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Audio player is initialized');
  }


  async loadPlaylist(): Promise<void> {
    this.playlistId = await this.fireStoreService.getUserPlaylistId(this.authService.getAuthState().uid);
    if (this.playlistId) {
      const clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
      const clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

      this.http.post('https://accounts.spotify.com/api/token', body, { headers })
        .subscribe(async (data: any) => {
          // Esto se ejecuta una vez Spotify responda a nuestra petición de obtener el token
          console.log('Access token obtained from API Spotify')

          await this.getTracks(this.playlistId || '', data.access_token);
        });
    }
  }

  async getTracks(playlistId: string, token: string): Promise<void> {
    let songs = await this.fireStoreService.retrievePlaylist(playlistId);

    songs.songIds.forEach(async s => {
      await this.getTrack(s, token);
    })
  }

  async getTrack(songId: string, token: string) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Petición HTTP GET para obtener las pistas más populares del artista
    this.http.get(`https://api.spotify.com/v1/tracks/${songId}`, { headers })
      .subscribe((data: any) => {
        // Asignación de las pistas obtenidas al array de tracks
        this.tracks.push(data);
      });
  }

  formatMillisecondsToMinutes(milliseconds: number): string {
    // Convertir milisegundos a minutos totales
    const totalMinutes = Math.floor(milliseconds / 60000);
    // Convertir milisegundos restantes a segundos
    const remainingSeconds = Math.floor((milliseconds % 60000) / 1000);

    // Formatear minutos y segundos para asegurar que siempre tengan dos dígitos
    const formattedMinutes = totalMinutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Devolver el tiempo en formato 00:00
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  async removeSong(songId: string) : Promise<void>  {
    await this.fireStoreService.removeSongFromPlaylist(this.playlistId || '', songId);
    this.tracks = this.tracks.filter(s => s.id != songId)
  }

  playTrack(previewUrl: string): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      try {
          if (this.audioPlayer.nativeElement.src !== previewUrl) {
              this.audioPlayer.nativeElement.src = previewUrl;
              this.audioPlayer.nativeElement.load();
          }
          this.audioPlayer.nativeElement.play().catch(e => {
              console.error("Error al reproducir la pista:", e);
              this.toastController.create({
                  message: 'Error al reproducir la pista. Por favor, intente de nuevo.',
                  duration: 2000
              }).then(toast => toast.present());
          });
      } catch (e) {
          console.error("Error en la reproducción:", e);
      }
  } else {
      console.error("El elemento audioPlayer aún no está disponible.");
  }


    // this.currentTrackUrl = previewUrl;
    // setTimeout(() => this.audioPlayer.nativeElement.play(), 0);
    //////////////////////////
    // this.audio = new Audio(previewUrl);
    // this.audio.play();
  }

  stopTrack(): void {
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 0;
      this.currentTrackUrl = null;  // Reset URL to remove the audio element
    }
    // this.audio?.pause();
    // this.audio = null;
  }


}
