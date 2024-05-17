import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline } from 'ionicons/icons';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.page.html',
  styleUrls: ['./search-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})

export class TestPagePage implements OnInit, AfterViewInit {
  artistName: string = ''; // Variable vinculada al formulario
  artist: string | null = null; // Aquí se mostrará el nombre del artista
  tracks: any[] = []; // Aquí almacenaremos las canciones
  trackId: string | undefined;
  audio: HTMLMediaElement | null = null;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  currentTrackUrl: string | null = null;

  constructor(
    public toastController: ToastController,
    public authService: AuthService,
    public fireStoreService: FirestoreService,
    public spotifyService: SpotifyService,
    public router: Router,
    public platform: Platform) {
    addIcons({ playOutline });
    addIcons({ stopOutline });

  }

  ngOnInit() {
    console.log("Pagina cargada y preparada para buscar canciones");
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Audio player is initialized');
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
  getArtistTracks(artistId: string, accessToken: string) {
    this.spotifyService.getArtistTracks(artistId, accessToken).subscribe({
      next: data => {
        this.tracks = data.tracks;
      },
      error: error => console.error('Error fetching tracks:', error)
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
   * Metodo para añadir una canción a una playlist del usuario con servicios de autenticación y bases de datos de Firebase
   * para gestionar las listas de reproducción de los usuarios.
   * @param songId 
   */
  async addTrackToPlaylist(songId: string) {
    /*
    Para obtener el ID de la playlist del usuario actual utilizamos el servicio fireStoreService 
    que a su vez recoge el ID de usuario autenticado mediante 'authService.getAuthState().uid'
    */
    const playlistId = await this.fireStoreService.getUserPlaylistId(this.authService.getAuthState().uid);

    if (!playlistId) {
      // Significa que la playlistId aún no existe, por lo tanto tenemos que crearla de 0 y asignarla
      // Creamos la nueva playlist y obtenemos el id
      const newPlaylistId = await this.fireStoreService.createPlaylistWithSong(songId);
      // A continuación, actualizaremos el usuario para ponerle esta playlistId
      await this.fireStoreService.updateUserPlaylistId(this.authService.getAuthState().uid, newPlaylistId);
    } else {
      // Significa que ya existe, por lo tanto solo tenemos que añadir una nueva canción a la playlist exitente
      await this.fireStoreService.addSongToPlaylist(playlistId, songId);
    }

    // Mostrar un mensaje de confirmación.
    const toast = await this.toastController.create({
      message: 'Canción añadida correctamente!',
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  /**
   * Metodo para redirigir al usuario a una vista específica basada en la información de un artista y una pista musical seleccionados.
   * @param track 
   */
  goToTvMode(track: any) {
    console.log(track.id);
    const trackId = track.id;

    const artistSelected = this.artistName;
    this.router.navigate(['/tvmode/' + artistSelected + '/' + trackId]);
  }

  /**
   * Metodo para gestionar la reproducción de una pista de audio, utilizando una URL de vista previa
   * @param previewUrl 
   */
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
  }

  /**
   * Metodo para detener la reproducción de una pista de audio y 
   * restablecer el estado del reproductor de audio a su posición inicial.
   */
  stopTrack(): void {
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 0;
      this.currentTrackUrl = null;
    }
  }
}
