import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
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
    public toastController: ToastController,
    public authService: AuthService,
    public fireStoreService: FirestoreService,
    private spotifyService: SpotifyService,
  ) {
    addIcons({ playOutline });
    addIcons({ stopOutline });
  }


  ngOnInit() {
    if (this.authService.getAuthState()) {
      this.loadPlaylist();
    }
    this.reproducingTrack = false;

  }
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Audio player is initialized');
  }

  /**
   * Método para activar/desactivarl el modo TV
   */
  toggleTvMode(): void {
    this.tvMode = !this.tvMode;
  }

  /**
   * Método para cargar la playlist del usuario actual
   */
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

  /**
   * Método que recupera las pistas de la playlist especificada utilizando el token de acceso proporcionado.
   * Obtiene detalles completos de cada pista en la playlist desde Spotify y los añade a la lista de pistas local,
   * incluyendo los votos asociados con cada pista.
   * @param playlistId 
   * @param token 
   */
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

  /**
   * Elimina una canción de la playlist actual. Elimina la canción especificada tanto de la base de datos utilizando FirestoreService
   * como de la lista local de pistas, asegurando que la vista se actualice adecuadamente.
   * @param songId El identificador de la canción a eliminar.
   */
  async removeSong(songId: string): Promise<void> {
    await this.fireStoreService.removeSongFromPlaylist(this.playlistId || '', songId);
    this.tracks = this.tracks.filter(s => s.id != songId)
  }

  /**
   * Reproduce la pista seleccionada en el reproductor de audio. Configura la fuente de audio con la URL de previsualización
   * de la pista si aún no está configurada y gestiona la reproducción.
   * @param index Posición de la pista en el array de pistas que se quiere reproducir.
   */
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

  /**
   * Configura el modo TV estableciendo la pista actual para su visualización en un modo visualmente más atractivo.
   * @param track La pista que se mostrará en el modo TV.
   */
  goTvMode(track: any) {
    this.currentTrack = track;
  }

  /**
   * Reproduce la siguiente pista en la lista basándose en el índice proporcionado.
   * Si el índice excede el número de pistas disponibles, se registra un mensaje por consola indicando el fin de la lista de reproducción.
   * @param nextIndex La posición en array de la siguiente pista a reproducir.
   */
  playNextTrack(nextIndex: number): void {
    if (nextIndex < this.tracks.length) {
      this.playTrack(nextIndex);
    } else {
      console.log("Fin de la lista de reproducción");
      // Opcional: Repetir la lista desde el principio
      // this.playTrack(0); // Descomentar esta línea para que la reproducción se repita automáticamente
    }
  }

  /**
   * Detiene la reproducción de la pista actual y reinicia el reproductor de audio. 
   * Esto incluye pausar la reproducción, restablecer el tiempo de la pista a cero,
   * y limpiar la URL de la pista actual. Además, actualiza el estado para indicar que no hay ninguna pista reproduciéndose.
   */
  stopTrack(): void {
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 0;
      this.currentTrackUrl = null;
      this.reproducingTrack = false;
    }
  }

  /**
   * Incrementa el conteo de votos para una canción específica en la playlist actual.
   * Utiliza el servicio FirestoreService para actualizar la cantidad de votos de la canción en la base de datos.
   * @param songId El identificador de la canción a la que se le añadirá un voto.
   */
  async voteSong(songId: string): Promise<void> {
    try {
      await this.fireStoreService.voteSong(this.playlistId || '', songId);
    } catch (error) {
      console.error('Error al votar:', error);
    }
  }


}


