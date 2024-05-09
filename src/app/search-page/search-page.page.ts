import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Platform } from '@ionic/angular';


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
    private http: HttpClient,
    public toastController: ToastController,
    public authService: AuthService,
    public fireStoreService: FirestoreService,
    public router: Router,
    public platform: Platform) {

  }

  ngOnInit() {
    console.log("Pagina cargada y preparada para buscar canciones");
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Audio player is initialized');
  }

  /**
   * Metodo para autenticarse con la API de Spotify para obtener el ACCESS_TOKEN, que luego es utilizado en una 
   * llamada subsiguiente para buscar realmente los detalles del artista.
   * Docs: https://developer.spotify.com/documentation/web-api/tutorials/getting-started
   * @param artistName 
   */
  getArtistDetails(artistName: string) {
    const clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
    const clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

    /*Se realiza una solicitud POST a la URL de la API de Spotify para obtener el ACCESS_TOKEN. 
      Usa las cabeceras y el cuerpo configurados anteriormente.*/
    this.http.post('https://accounts.spotify.com/api/token', body, { headers })
      .subscribe((data: any) => {
        //console.log('Access token obtained from API Spotify')
        // console.log(data) // Pintamos el token por consola - OPCIONAL
        console.log(artistName)
        artistName = this.artistName;
        this.searchArtist(artistName, data.access_token);
      });
  }

  /**
   * Metodo hacer la conexión entre el cliente (la aplicación) y un servicio web externo para acceder a datos concretos (canciones)
   * basados en el nombre del artista
   * @param artistName 
   * @param token 
   */
  private searchArtist(artistName: string, token: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Aqui preparamos la petición en la que buscamos el nombre del artista y especificamos que estamos buscando un artista (&type=artist)
    // Docs https://developer.spotify.com/documentation/web-api/reference/search
    this.http.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, { headers })
      .subscribe((data: any) => {
        console.log('Data obtained from Spotify API')
        console.log(data)
        this.artist = data.artists.items[0]?.name || 'Artist not found';

        // Si se encuentra un artista, se llama al método para obtener las canciones
        if (this.artist !== 'Artist not found') {
          this.getArtistTracks(data.artists.items[0].id, token);
        }
      });
  }

  /**
   *  Metodo para recuperar las pistas más populares de un artista específico utilizando la API de Spotify
   * @param artistId 
   * @param token 
   */
  private getArtistTracks(artistId: string, token: string) {
    // Encabezados de la solicitud HTTP con el token de autorización
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Petición HTTP GET para obtener las pistas más populares del artista
    this.http.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`, { headers })
      .subscribe((data: any) => {
        // Asignación de las pistas obtenidas al array de tracks
        this.tracks = data.tracks;
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
    Obteniendo el ID de la playlist del usuario actual utilizando el servicio fireStoreService 
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
