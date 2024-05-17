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
  reproducingTrack: boolean | undefined;
  public tvMode: boolean = false;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  currentTrackUrl: string | null = null;
  currentTrack: any;
  public getVotesSong: boolean = false;


  constructor(
    private http: HttpClient, 
    public toastController: ToastController, 
    public authService: AuthService, 
    public fireStoreService: FirestoreService, 
    private spotifyService: SpotifyService,
  ) {
    addIcons({ playOutline });
    addIcons({ stopOutline });
  }


  ngOnInit() {
    if(this.authService.getAuthState()){
      this.loadPlaylist();
    }
    this.reproducingTrack = false;
    
  }
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Audio player is initialized');
  }

  // Método para activar/desactivar el modo TV
  toggleTvMode(): void {
    this.tvMode = !this.tvMode;
  }

  async loadPlaylist() {
     this.playlistId = await this.fireStoreService.getUserPlaylistId(this.authService.getAuthState().uid);
    if (this.playlistId) {
      this.spotifyService.getAccessToken().subscribe({
        next: (tokenData) => {
          this.getTracks(this.playlistId!, tokenData.access_token);
        },
        error: (error) => console.error('Error obtaining access token:', error)
      });
    }
  }


  async getTracks(playlistId: string, token: string) {
    let playlist = await this.fireStoreService.retrievePlaylist(playlistId);
    console.log(playlist);
    playlist.entries.forEach(entry => {
      this.spotifyService.getTrackDetails(entry.songId, token).subscribe({
        next: (trackData) => {
          trackData.votes = entry.votes; // Adding votes to track data
          this.tracks.push(trackData);
        },
        error: (error) => console.error('Error fetching track details:', error)
      });
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

  playTrack(index: number): void {
    if (index < this.tracks.length && this.audioPlayer && this.audioPlayer.nativeElement) {
      const track = this.tracks[index];
      if (this.audioPlayer.nativeElement.src !== track.preview_url) {
        this.audioPlayer.nativeElement.src = track.preview_url;
        this.audioPlayer.nativeElement.load();
      }
      this.audioPlayer.nativeElement.play().then(() => {
        console.log("Reproducción iniciada!");
        this.reproducingTrack = true;
        this.goTvMode(track);
        
      }).catch(e => {
        console.error("Error al reproducir la pista:", e);
        this.toastController.create({
          message: 'Error al reproducir la pista. Por favor, intente de nuevo.',
          duration: 2000
        }).then(toast => toast.present());
      });
  
      // Configura la reproducción automática de la siguiente pista cuando esta termine
      this.audioPlayer.nativeElement.onended = () => {
        this.playNextTrack(index + 1);
      };
    } else {
      console.error("Índice de pista fuera de rango o audioPlayer no disponible.");
    }
  }
  goTvMode(track: any) {
    this.currentTrack = track;
  }

  playNextTrack(nextIndex: number): void {
    if (nextIndex < this.tracks.length) {
      this.playTrack(nextIndex);
    } else {
      console.log("Fin de la lista de reproducción");
      // Opcional: Repetir la lista desde el principio
      // this.playTrack(0); // Descomenta esta línea si deseas que la reproducción se repita automáticamente
    }
  }

  stopTrack(): void {
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 0;
      this.currentTrackUrl = null;  // Reset URL to remove the audio element
      this.reproducingTrack = false;
    }
    // this.audio?.pause();
    // this.audio = null;
  }


  async voteSong(songId: string): Promise<void> {
    try {
      await this.fireStoreService.voteSong(this.playlistId || '', songId);
    } catch (error) {
      console.error('Error al votar:', error);
    }
  }


}


