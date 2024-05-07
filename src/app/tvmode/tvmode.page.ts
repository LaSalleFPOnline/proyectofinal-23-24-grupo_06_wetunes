import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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
  

  constructor(private http: HttpClient, public toastController: ToastController, private router: Router, public activatedRoute: ActivatedRoute) { }

  ngOnInit() {

    const artistSelected = this.activatedRoute.snapshot.paramMap.get('artistSelected');
    const trackId = this.activatedRoute.snapshot.paramMap.get('trackId');
   
    if(artistSelected && trackId){
      this.artistName = artistSelected;
      this.trackName = trackId;
    }

    this.getArtistDetails(this.artistName);

  }

  getArtistDetails(artistName: string) {

    const clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
    const clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

    this.http.post('https://accounts.spotify.com/api/token', body, { headers })
      .subscribe((data: any) => {
        // Esto se ejecuta una vez Spotify responda a nuestra petición de obtener el token
       
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
}