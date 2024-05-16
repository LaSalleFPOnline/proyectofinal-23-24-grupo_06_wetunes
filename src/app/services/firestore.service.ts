import { Injectable } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "@angular/fire/firestore";
import { UserInterface } from "../interfaces/user.interface";
import { PlaylistInterface } from "../interfaces/playlist.interface";
import { SessionInterface } from "../interfaces/session.interface";

// Servicio proveedor de métodos para interactuar con Firestore
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  fireStoreService: any;


  // Inyecta la instancia de Firestore al servicio
  constructor(private firestore: Firestore) { }

  // Agrega un usuario a la colección 'usuarios' usando un ID específico
  addUser(user: UserInterface, userId: string) {
    const userRef = doc(this.firestore, 'usuarios', userId);
    return setDoc(userRef, user);
  }

  // Recupera un usuario por ID desde Firestore, lanzando error si no existe
  async retrieveUser(userId: string): Promise<UserInterface> {
    const userDocRef = doc(this.firestore, 'usuarios', userId);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserInterface;
      return userData;
    } else {
      throw new Error('User doesnt exist');
    }
  }

  // Recupera una sesión por ID, lanzando error si no existe
  async retrieveSession(sessionId: string): Promise<SessionInterface> {
    const sessionDocRef = doc(this.firestore, 'sesiones', sessionId);
    const docSnapshot = await getDoc(sessionDocRef);
    if (docSnapshot.exists()) {
      const sessionData = docSnapshot.data() as SessionInterface;
      return sessionData;
    } else {
      throw new Error('Session doesnt exist');
    }
  }

  // Recupera una lista de reproducción por ID, lanzando error si no existe
  async retrievePlaylist(playlistId: string): Promise<PlaylistInterface> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId);
    const docSnapshot = await getDoc(playlistDocRef);
    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      playlistData.entries.sort((e1, e2) => e2.votes - e1.votes);
      return playlistData;
    } else {
      throw new Error('Playlist doesnt exist');
    }
  }

  // Agrega un usuario a la colección 'usuarios' sin especificar un ID
  addUserWithoutId(user: UserInterface) {
    const userRef = collection(this.firestore, 'usuarios');
    return addDoc(userRef, user);
  }

  // Agrega una sesión a Firestore usando un ID específico
  addSession(session: SessionInterface, sessionId: string) {
    const sessionRef = doc(this.firestore, 'sesiones', sessionId);
    return setDoc(sessionRef, session);
  }

  // Verifica si una sesión existe en Firestore
  async checkSession(sessionId: string): Promise<boolean> {
    const sessionDocRef = doc(this.firestore, 'sesiones', sessionId);
    const docSnapshot = await getDoc(sessionDocRef);
    return docSnapshot.exists();
  }

  // Actualiza el ID de la lista de reproducción para un usuario específico
  async updateUserPlaylistId(userId: string, playlistId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'usuarios', userId);
    try {
      await updateDoc(userDocRef, { playlistId: playlistId });
      console.log("User playlistId updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      throw new Error("Failed to update user playlistId");
    }
  }

  // Actualiza el ID de la sesión para un usuario específico
  async updateUserSessionId(userId: string, sessionId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'usuarios', userId);
    try {
      await updateDoc(userDocRef, { sessionId: sessionId });
      console.log("User sessionId updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      throw new Error("Failed to update user sessionId");
    }
  }

  // Obtiene el ID de la lista de reproducción de un usuario, devolviendo null si no existe
  async getUserPlaylistId(userId: string): Promise<string | null> {
    const userDocRef = doc(this.firestore, 'usuarios', userId);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserInterface;
      if (userData.sessionId != '') {
        // Significa que está conectado a una sesión, por lo tanto, el playlistId que tenemos que devolver es el asociado
        // a dicha sesión
        // Cogemos el objeto sesión con esa key
        const sessionSnapshot = await getDoc(doc(this.firestore, 'sesiones', userData.sessionId));
        if (sessionSnapshot.exists()) {
          // Devolvemos la playlistId asociado a dicha sesión
          const sessionData = sessionSnapshot.data() as SessionInterface;
          return sessionData.playlistId;
        } else {
          // Esta exception no debería sucerdese, pero la ponemos por siaca
          throw new Error("Sesión no existe")
        }
      } else {
        return userData.playlistId || null;
      }
    } else {
      return null;
    }
  }

  // Crea una nueva lista de reproducción con una canción específica
  async createPlaylistWithSong(songId: string): Promise<string> {

    const newPlaylist: PlaylistInterface = { entries: [{songId: songId, votes:0}] };
    const playlistsRef = collection(this.firestore, 'playlists');
    try {
      const docRef = await addDoc(playlistsRef, newPlaylist);
      console.log("Playlist created with ID:", docRef.id);

      return docRef.id;
    } catch (error) {
      console.error("Error adding playlist: ", error);
      throw new Error("Failed to create playlist");
    }
  }

  // Agrega una canción a una lista de reproducción existente
  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId);
    const docSnapshot = await getDoc(playlistDocRef);
    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      if (!playlistData.entries.map(e => e.songId).includes(songId)) {
        playlistData.entries.push({songId: songId, votes: 0})
        await updateDoc(playlistDocRef, { entries: playlistData.entries });

      }
    } else {
      throw new Error('Playlist not found');
    }
  }

  // Elimina una canción de una lista de reproducción existente
  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId);
    const docSnapshot = await getDoc(playlistDocRef);
    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      if (playlistData.entries.map(e => e.songId).includes(songId)) {
        playlistData.entries = playlistData.entries.filter(e => e.songId != songId);
        await updateDoc(playlistDocRef, { entries: playlistData.entries });
      }
    } else {
      throw new Error('Playlist not found');
    }
  }

  // Limpia el ID de la sesión en todos los documentos que lo contienen
  async clearSessionId(currentSessionId: string): Promise<void> {
    try {
      const snapshot = await getDocs(query(collection(this.firestore, "usuarios"), where("sessionId", "==", currentSessionId)));
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }
      snapshot.forEach(async doc => {
        let key: string = doc.id
        await this.updateUserSessionId(key, "")
      });
      console.log('Session IDs cleared successfully.');
    } catch (error) {
      console.error('Error updating documents: ', error);
    }
  }

  // Código para votar canciones
  async voteSong(playlistId: string, songId: string): Promise<void> {
    try {
      const playlistDocRef = doc(this.firestore, 'playlists', playlistId);
      const docSnapshot = await getDoc(playlistDocRef);
      if (docSnapshot.exists()) {
        const playlistData = docSnapshot.data() as PlaylistInterface;
        if (playlistData.entries.map(e => e.songId).includes(songId)) {
          let i = playlistData.entries.findIndex(e => e.songId == songId);
          playlistData.entries[i].votes += 1;
          await updateDoc(playlistDocRef, { entries: playlistData.entries });
        }
      } else {
        throw new Error('Playlist not found');
      }
    } catch (error) {
      console.error('Error al votar:', error);
    }
  }

}
