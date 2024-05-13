import { Injectable } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "@angular/fire/firestore";
import { UserInterface } from "../interfaces/user.interface";
import { PlaylistInterface } from "../interfaces/playlist.interface";
import { SessionInterface } from "../interfaces/session.interface";
@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  constructor(private firestore: Firestore) { }

  addUser(user: UserInterface, userId: string) {
    const userRef = doc(this.firestore, 'usuarios', userId);
    return setDoc(userRef, user);
  }

  async retrieveUser(userId: string): Promise<UserInterface> {
    const userDocRef = doc(this.firestore, 'usuarios', userId);
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserInterface;
      return userData
    } else {
      throw new Error('User doesnt exist')
    }
  }

  async retrieveSession(sessionId: string): Promise<SessionInterface> {
    const sessionDocRef = doc(this.firestore, 'sesiones', sessionId);
    const docSnapshot = await getDoc(sessionDocRef);

    if (docSnapshot.exists()) {
      const sessionData = docSnapshot.data() as SessionInterface;
      return sessionData
    } else {
      throw new Error('Session doesnt exist')
    }
  }

  async retrievePlaylist(playlistId: string): Promise<PlaylistInterface> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId);
    const docSnapshot = await getDoc(playlistDocRef);

    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      return playlistData
    } else {
      throw new Error('Playlist doesnt exist')
    }
  }

  addUserWithoutId(user: UserInterface) {
    const userRef = collection(this.firestore, 'usuarios');
    return addDoc(userRef, user);
  }

  addSession(session: SessionInterface, sessionId: string) {
    const sessionRef = doc(this.firestore, 'sesiones', sessionId);
    return setDoc(sessionRef, session);
  }

  async checkSession(sessionId: string): Promise<boolean> {
    const sessionDocRef = doc(this.firestore, 'sesiones', sessionId); // Reference to the user document
    const docSnapshot = await getDoc(sessionDocRef); // Fetch the document

    if (docSnapshot.exists()) {
      return true;
    } else {
      return false;
    }
  }

  async updateUserPlaylistId(userId: string, playlistId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'usuarios', userId); // Reference to the user document

    try {
      await updateDoc(userDocRef, {
        playlistId: playlistId // Update the playlistId field
      });
      console.log("User playlistId updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      throw new Error("Failed to update user playlistId"); // Optionally throw an error
    }
  }

  async updateUserSessionId(userId: string, sessionId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'usuarios', userId); // Reference to the user document

    try {
      await updateDoc(userDocRef, {
        sessionId: sessionId // Update the sessionId field
      });
      console.log("User sessionId updated successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      throw new Error("Failed to update user sessionId"); // Optionally throw an error
    }
  }

  async getUserPlaylistId(userId: string): Promise<string | null> {
    const userDocRef = doc(this.firestore, 'usuarios', userId); // Reference to the user document
    const docSnapshot = await getDoc(userDocRef); // Fetch the document

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserInterface;
      return userData.playlistId || null; // Return the playlistId or null if it doesn't exist
    } else {
      // If the user does not exist, return null or handle as needed
      return null;
    }
  }

  async createPlaylistWithSong(songId: string): Promise<string> {
    // Create a new Playlist object
    const newPlaylist: PlaylistInterface = {
      songIds: [songId]
    };

    // Reference to the 'playlists' collection in Firestore
    const playlistsRef = collection(this.firestore, 'playlists');

    // Add the new Playlist to Firestore
    try {
      const docRef = await addDoc(playlistsRef, newPlaylist);
      console.log("Playlist created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding playlist: ", error);
      throw new Error("Failed to create playlist");  // Optionally throw an error
    }
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId); // Reference to the playlist document
    const docSnapshot = await getDoc(playlistDocRef); // Fetch the document

    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      if (!playlistData.songIds.includes(songId)) {
        playlistData.songIds.push(songId); // Add songId to the list of song IDs in the playlist

        // Update the playlist object in Firebase
        await updateDoc(playlistDocRef, {
          songIds: playlistData.songIds
        });
      }
    } else {
      // If the playlist does not exist, throw an error or handle as needed
      throw new Error('Playlist not found');
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlistDocRef = doc(this.firestore, 'playlists', playlistId); // Reference to the playlist document
    const docSnapshot = await getDoc(playlistDocRef); // Fetch the document

    if (docSnapshot.exists()) {
      const playlistData = docSnapshot.data() as PlaylistInterface;
      if (playlistData.songIds.includes(songId)) {
        playlistData.songIds = playlistData.songIds.filter(s => s != songId); // Add songId to the list of song IDs in the playlist

        // Update the playlist object in Firebase
        await updateDoc(playlistDocRef, {
          songIds: playlistData.songIds
        });
      }
    } else {
      // If the playlist does not exist, throw an error or handle as needed
      throw new Error('Playlist not found');
    }
  }

  async clearSessionId(currentSessionId: string): Promise<void> {
    try {
      // Query the documents with the specific sessionId
      const snapshot = await getDocs(query(collection(this.firestore, "usuarios"), where("sessionId", "==", currentSessionId)));

      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }

      snapshot.forEach(async doc => {
        let key : string = doc.id
        await this.updateUserSessionId(key, "")
      });

      console.log('Session IDs cleared successfully.');
    } catch (error) {
      console.error('Error updating documents: ', error);
    }
  }
}
