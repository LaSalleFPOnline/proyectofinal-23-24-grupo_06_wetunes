import { Component, OnInit, inject } from '@angular/core';
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
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  artistName: string = ''; // Variable vinculada al formulario
  artist: string | null = null; // Aquí se mostrará el nombre del artista
  tracks: any[] = []; // Aquí almacenaremos las canciones
  audio: HTMLMediaElement | null = null;

  constructor(private http: HttpClient, public toastController: ToastController, public authService: AuthService, public fireStoreService: FirestoreService, private spotifyService: SpotifyService) {
    addIcons({ playOutline, stopOutline });
  }

  ngOnInit() { }

  getArtistDetails(artistName: string) {
    /** Este método lo que realmente hace es obtener el ACCESS_TOKEN para la API de Spotify.
     * Este ACCESS_TOKEN es lo necesario para poder realizar llamadas a la API de Spotify */


    /** Docs: https://developer.spotify.com/documentation/web-api/tutorials/getting-started  */

    const clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
    const clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

    this.http.post('https://accounts.spotify.com/api/token', body, { headers })
      .subscribe((data: any) => {
        // Esto se ejecuta una vez Spotify responda a nuestra petición de obtener el token
        console.log('Access token obtained from API Spotify')
        console.log(data) // Pintamos el token por consola - OPCIONAL
        this.searchArtist(artistName, data.access_token);
      });
  }

  private searchArtist(artistName: string, token: string) {
    // El header contiene unicamente el token
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

  // Método privado para obtener las pistas más populares del artista
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

  async addTrackToPlaylist(songId: string) {
    // Aquí puedes añadir la lógica para agregar la canción realmente a la playlist.

    /*
    1- Necesitamos obtener el playlistId del usuario actual, en caso de que no tenga,
      significa que es la primera vez que va a añadir una canción, por lo tanto
      tenemos que crear una playlist nueva y asignarle el id al usuario

    2- Si no tenemos id, crear el objeto con los ids de las canciones y al insertar el playlist
      en firebase ya nos dará el id que lo ponemos al usuario
    
    3- si si lo tenemos, simplemente añadir dicha canción al array de objetos existentes
      en firebase
    */

    const playlistId = await this.fireStoreService.getUserPlaylistId(this.authService.getAuthState().uid);

    if (!playlistId) {
      // Significa que la playlistId aún no existe, por lo tanto tenemos que crearla de 0 y asignarla
      // Creamos la nueva playlist y obtenemos el id
      const newPlaylistId = await this.fireStoreService.createPlaylistWithSong(songId);
      // A continuación, actualizaremos el usuario para ponerle esta playlistId
      await this.fireStoreService.updateUserPlaylistId(this.authService.getAuthState().uid, newPlaylistId);
    } else {
      // Significa que ya existe, por lo tanto solo tenemos que "pushear" una nueva canción
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

  getTrackDetails() {
    const token = 'your_access_token'; // This should be dynamically obtained from the URL or storage
    this.spotifyService.getTrack(token, 'track_id_here').subscribe(track => {
      console.log(track);
    });
  }

  playTrack(previewUrl: string): void {
    this.audio = new Audio(previewUrl);
    this.audio.play();
  }

  stopTrack(): void {
    this.audio?.pause();
    this.audio = null;
  }


}