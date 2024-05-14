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
  votosPorCancion: { [songId: string]: number | null } = {}; // Nueva propiedad para almacenar los votos por canción


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
    this.loadTrackWithVotes(); //En este punto las canciones ya estan añadidas a la variable tracks
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
      await this.fireStoreService.voteSong(songId);

    } catch (error) {
      console.error('Error al votar:', error);
    }
  }

  async getVotes(songId: string): Promise<number | null> {
    try {
      // Obtener los votos de Firestore a través del servicio
      const votes = await this.fireStoreService.getVotesForSong(songId);
      
      // Si hay votos para esta canción, devolver el número de votos
      if (votes !== null) {
        console.log("votes", votes); //Aquí se muestran los votos pero no se ven en el navegador
        return votes;
      } else {
        console.error('No se encontraron votos para la canción.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los votos:', error);
      return null;
    }
  }   
  
  async loadTrackWithVotes(): Promise<void> {
    console.log("entra", this.tracks); //Este muestra el array correcto
    console.log("entra2", this.tracks[0]); //Este muestra undefined
      // Cargamos las canciones con sus votos
      this.tracks.forEach( track => {
        console.log("entra3");
        console.log("track id", track.id);
        //const votes = await this.getVotes(track.id);
        //this.votosPorCancion[track.id] = votes;
      });
  }

}


