import { Injectable } from "@angular/core";
import { Firestore, collection, addDoc } from "@angular/fire/firestore";
import { UserInterface } from "../user.interface";
@Injectable({
    providedIn: 'root'
})

export class FirestoreService {

    constructor(private firestore: Firestore){}

    addUser(user: UserInterface){
        const userRef = collection(this.firestore, 'usuarios');
        return addDoc(userRef, user);
    }
}