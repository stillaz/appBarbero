import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UsuarioOptions } from '../interfaces/usuario-options';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private angularFirestore: AngularFirestore) { }

  public clientesTelefono(telefono: string) {
    const clienteCollection = this.angularFirestore.collection<UsuarioOptions>('clientes', ref => ref.where('telefono', '==', telefono).limit(1));
    return clienteCollection.valueChanges();
  }

  public saveCliente(clienteData: any) {
    let respuesta: Promise<void>;
    let usuarioDoc: AngularFirestoreDocument;
    if (clienteData.usuario === 'usuario') {
      usuarioDoc = this.angularFirestore.doc(`clientes/${clienteData.id}`);
      respuesta = usuarioDoc.update({ telefono: clienteData.telefono });
    } else {
      const cliente = clienteData as UsuarioOptions;
      cliente.correoelectronico = cliente.correoelectronico || '';
      cliente.id = cliente.telefono;
      usuarioDoc = this.angularFirestore.doc(`clientes/${clienteData.telefono}`);
      respuesta = usuarioDoc.set(cliente);
    }

    return respuesta;
  }
}
