import { Injectable } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc, getDoc, updateDoc } from "@angular/fire/firestore";
import { UserInterface } from "../interfaces/user.interface";
import { PlaylistInterface } from "../interfaces/playlist.interface";
@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  constructor(private firestore: Firestore) { }

  addUser(user: UserInterface, userId: string) {
    const userRef = doc(this.firestore, 'usuarios', userId);
    return setDoc(userRef, user);
  }

  addUserWithoutId(user: UserInterface) {
    const userRef = collection(this.firestore, 'usuarios');
    return addDoc(userRef, user);
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
}