import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ServicioOptions } from '../interfaces/servicio-options';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  constructor(private angularFirestore: AngularFirestore) { }

  serviciosGrupos(idempresa: string, grupos: string[]) {
    const serviciosCollection = this.angularFirestore.collection<ServicioOptions>(`negocios/${idempresa}/servicios`);
    return serviciosCollection.ref.where('grupo', 'array-contains-any', grupos).orderBy('nombre').get();
  }
}
