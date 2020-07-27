import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UsuarioOptions } from '../interfaces/usuario-options';
import { AngularFireAuth } from '@angular/fire/auth';
import { ConfiguracionOptions } from '../interfaces/configuracion-options';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  administrador = false;
  currentUser: User;
  usuarioLogueado: UsuarioOptions;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore
  ) { }

  actualizacion(usuario: string) {
    const usuarioDocument = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuario}`);
    return usuarioDocument.update({ actualizacion: new Date() });
  }

  async saveClave(clave: string) {
    const user = await this.angularFireAuth.currentUser;
    user.updatePassword(clave).then(() => {
      this.angularFireAuth.signOut();
    });
  }

  async saveCorreo(email: string, empresa: string) {
    const user = await this.angularFireAuth.currentUser;
    const usuario = user.uid;
    user.updateEmail(email).then(() => {
      const usuarioDocument = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuario}`);
      usuarioDocument.update({ email: email, actualizacion: new Date() });
      const usuarioEmpresaDocument = this.angularFirestore
        .doc<UsuarioOptions>(`empresa/${empresa}/usuarios/${usuario}`);
      usuarioEmpresaDocument.update({ email: email, actualizacion: new Date() });
      this.angularFireAuth.signOut();
    });
  }

  saveData(usuarioId: string, telefono: string, imagen: string, empresa: string) {
    let batch = this.angularFirestore.firestore.batch();
    const usuarioDocument = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuarioId}`);
    batch.update(usuarioDocument.ref, { telefono: telefono, imagen: imagen, actualizacion: new Date() });
    const usuarioEmpresaDocument = this.angularFirestore
      .doc<UsuarioOptions>(`empresa/${empresa}/usuarios/${usuarioId}`);
    batch.update(usuarioEmpresaDocument.ref, { telefono: telefono, imagen: imagen, actualizacion: new Date() });
    return batch.commit();
  }

  saveHorario(usuario: string, horario: ConfiguracionOptions) {
    const usuarioDocument = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuario}`);
    return usuarioDocument.update({ configuracion: horario });
  }

  usuario(usuario: string) {
    const usuarioDoc = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${usuario}`);
    return usuarioDoc.valueChanges();
  }
}
