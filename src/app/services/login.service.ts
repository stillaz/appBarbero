import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { UsuarioOptions } from '../interfaces/usuario-options';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  administrador = false;
  currentUser: User;
  usuario: UsuarioOptions;

  constructor(private angularFireAuth: AngularFireAuth, private angularFirestore: AngularFirestore) { }

  login(usuario: string, clave: string) {
    return this.angularFireAuth.signInWithEmailAndPassword(usuario, clave);
  }

  logout() {
    return this.angularFireAuth.signOut();
  }

  async saveCorreo(email: string, empresa: string) {
    const fecha = new Date();
    const user = await this.angularFireAuth.currentUser;
    const usuario = user.uid;
    user.updateEmail(email).then(() => {
      const usuarioDocument = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuario}`);
      usuarioDocument.update({ email, actualizacion: fecha });
      const usuarioEmpresaDocument = this.angularFirestore
        .doc<UsuarioOptions>(`empresa/${empresa}/usuarios/${usuario}`);
      usuarioEmpresaDocument.update({ email, actualizacion: fecha });
      this.angularFireAuth.signOut();
    });
  }

  async saveClave(clave: string) {
    const user = await this.angularFireAuth.currentUser;
    user.updatePassword(clave).then(() => {
      this.angularFireAuth.signOut();
    });
  }
}
