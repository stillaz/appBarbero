import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  constructor(private angularFirestore: AngularFirestore) { }

  eliminar(usuario: string, noDisponible: string) {
    const indisponibilidadDocument = this.angularFirestore
      .doc<any>(`usuarios/${usuario}/indisponibilidades/${noDisponible}`);

    indisponibilidadDocument.delete();
  }

  noDisponible(usuario: string, id: string) {
    const indisponibilidadCollection = this.angularFirestore.doc<any>(`usuarios/${usuario}/indisponibilidades/${id}`);
    return indisponibilidadCollection.valueChanges();
  }

  async horarioNoDisponible(usuario: string) {
    const indisponibilidadCollection = this.angularFirestore.collection<any>(`usuarios/${usuario}/indisponibilidades`);
    return await indisponibilidadCollection.ref.orderBy('fechaDesde').get();
  }

  indisponibilidades(usuario: string) {
    const indisponibilidadCollection = this.angularFirestore
      .collection<any>(`usuarios/${usuario}/indisponibilidades`, ref => ref.orderBy('fechaDesde'));
    return indisponibilidadCollection.valueChanges();
  }

  saveNoDisponible(usuario: string, noDisponible: any) {
    const id = noDisponible.id || this.angularFirestore.createId();
    noDisponible.id = id;
    const noDisponibilidadDoc = this.angularFirestore.doc(`usuarios/${usuario}/indisponibilidades/${id}`);
    return noDisponibilidadDoc.set(noDisponible);
  }
}
