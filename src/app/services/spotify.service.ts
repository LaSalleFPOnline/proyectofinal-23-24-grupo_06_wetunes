// src/app/spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Servicio marcado para ser provisto en la raíz del injector de la aplicación.
@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  // Inyecta el cliente HTTP de Angular para realizar solicitudes HTTP.
  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos de una pista específica de Spotify utilizando un token de acceso y el ID de la pista.
   * @param access_token Token de acceso OAuth proporcionado por Spotify para autenticar la solicitud.
   * @param trackId El ID de la pista que se desea recuperar de Spotify.
   * @returns Observable que emitirá la respuesta de la API de Spotify para la pista solicitada.
   */
  getTrack(access_token: string, trackId: string): Observable<any> {
    return this.http.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`  // Usa el token de acceso para autorizar la solicitud.
      }
    });
  }
}
