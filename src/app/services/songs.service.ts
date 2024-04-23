//Desde aquí lanzamos las consultas a la API

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

//Interfaz que representa las canciones que descargaremos de la API
//Este bloque de código se tendrá que revisar y poner a la manera que más nos convenga
export interface Song {
  _id: string;
  name: string;
  image: string;
  category: string;
}
//Lo que devolverá la API
type ApiResponse = { page: number, per_page: number, total: number, total_pages: number,
results: Song[] }

//----------- Hasta aquí (Min 20 del tutorial)

@Injectable({
  providedIn: 'root'
})
export class SongsService {

  httpClient = inject(HttpClient);

  getAll(): Promise<ApiResponse> {
      return firstValueFrom(
        this.httpClient.get<ApiResponse>('https://peticiones.online/api/products') //Cambiar URL
      )
  }

}
