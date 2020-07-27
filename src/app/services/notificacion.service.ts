import { Injectable } from '@angular/core';
import { MensajeOptions } from '../interfaces/mensaje-options';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  constructor(private angularFirestore: AngularFirestore, private angularFireFunctions: AngularFireFunctions) { }

  crearId() {
    return this.angularFirestore.createId();
  }

  eliminar(notificacion: string, usuario: string) {
    const notificacionDocument = this.angularFirestore.doc(`usuarios/${usuario}/notificaciones/${notificacion}`);
    notificacionDocument.delete();
  }

  leido(notificacion: string, usuario: string) {
    const notificacionDocument = this.angularFirestore.doc(`usuarios/${usuario}/notificaciones/${notificacion}`);
    notificacionDocument.update({ leido: true });
  }

  notificar(mensaje: MensajeOptions, idCliente: string) {
    if (mensaje.token) {
      this.angularFireFunctions.httpsCallable('notificarA')(mensaje).subscribe();
    } else {
      mensaje.token = null;
    }

    return this.angularFirestore.doc(`clientes/${idCliente}/notificaciones/${mensaje.data.id}`).set(mensaje);
  }

  notificacionUsuario(notificacion: string, usuario: string) {
    const notificacionDocument = this.angularFirestore.doc(`usuarios/${usuario}/notificaciones/${notificacion}`);
    return notificacionDocument.valueChanges();
  }

  notificacionesUsuario(usuario: string) {
    const notificacionesCollection = this.angularFirestore
      .collection<any>(`usuarios/${usuario}/notificaciones`, ref => ref.orderBy('fecha', 'desc'));
    return notificacionesCollection.valueChanges();
  }

}
