// spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private clientId = '0e2fa6d6a1ad4ae4b7d05797746fcaa5';
  private clientSecret = 'ef98271d9a204ca8acb9689c1d4139e5';
  
  constructor(private http: HttpClient) {}

  getAccessToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`;

    return this.http.post('https://accounts.spotify.com/api/token', body, { headers });
  }

  searchArtist(artistName: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, { headers });
  }

  getArtistTracks(artistId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`, { headers });
  }
}
