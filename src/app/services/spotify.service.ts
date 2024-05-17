import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
  private clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';

  constructor(private http: HttpClient) { }

  /**
   * Método que solicita un token de acceso a la API de Spotify utilizando las credenciales del cliente.
   * @returns Observable<any> Un Observable que emite la respuesta de la API de Spotify con el token de acceso.
   */
  getAccessToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`;

    return this.http.post('https://accounts.spotify.com/api/token', body, { headers });
  }

  /**
   * Método que busca un artista en la API de Spotify utilizando el nombre del artista y un token de acceso.
   * @param artistName El nombre del artista a buscar.
   * @param accessToken El token de acceso de Spotify necesario para la autenticación de la solicitud.
   * @returns Observable<any> Un Observable que emite la respuesta de la API de Spotify con los detalles del artista.
   */
  searchArtist(artistName: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, { headers });
  }

  /**
   * Obtiene las pistas más populares de un artista específico en la API de Spotify.
   * @param artistId El ID del artista para el que se quieren obtener las pistas.
   * @param accessToken El token de acceso de Spotify necesario para la autenticación de la solicitud.
   * @returns Observable<any> Un Observable que emite la respuesta de la API de Spotify con las pistas más populares del artista.
   */
  getArtistTracks(artistId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`, { headers });
  }

  /**
   * Obtiene los detalles de una pista específica en la API de Spotify.
   * @param trackId El ID de la pista para la que se quieren obtener los detalles.
   * @param accessToken El token de acceso de Spotify necesario para la autenticación de la solicitud.
   * @returns Observable<any> Un Observable que emite la respuesta de la API de Spotify con los detalles de la pista.
   */
  getTrackDetails(trackId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get(`https://api.spotify.com/v1/tracks/${trackId}`, { headers });
  }
}
