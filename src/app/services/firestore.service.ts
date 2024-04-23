import { Injectable } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc } from "@angular/fire/firestore";
import { UserInterface } from "../user.interface";
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

    //getPlaylistId()
}