import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private angularFireAuth: AngularFireAuth) { }

  login(usuario: string, clave: string) {
    return this.angularFireAuth.signInWithEmailAndPassword(usuario, clave);
  }

  logout() {
    return this.angularFireAuth.signOut();
  }
}
