import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import moment from 'moment';
import { Persona } from '../interfaces/persona';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private path = `negocios/${this.usuarioService.usuarioLogueado.idempresa}/personas`;

  constructor(private angularFirestore: AngularFirestore, private usuarioService: UsuarioService) { }

  ingreso(fecha: Date) {
    const id = moment(fecha).startOf('day').toDate().getTime();
    const ingresoCollection = this.angularFirestore
      .collection<Persona>(`negocios/${this.usuarioService.usuarioLogueado.idempresa}/ingresos/${id}/personas`,
        ref => ref.orderBy('nombre'));
    return ingresoCollection.valueChanges();
  }

  persona(id: string) {
    const personaDocument = this.angularFirestore.doc<Persona>(`${this.path}/${id}`);
    return personaDocument.ref.get();
  }

  personas(fecha?: Date) {
    const personaCollection = this.angularFirestore.collection<Persona>(this.path, ref => {
      if (fecha) {
        const fechaDesde = moment(fecha).startOf('day').toDate();
        const fechaHasta = moment(fecha).endOf('day').toDate();
        return ref.where('actualizacion', '>=', fechaDesde).where('actualizacion', '<=', fechaHasta);
      }
      return ref.orderBy('nombre');
    });
    return personaCollection.valueChanges();
  }

  salida(persona: string) {
    const fecha = new Date();
    const personaDocument = this.angularFirestore.doc(`${this.path}/${persona}`).ref;

    return this.angularFirestore.firestore.runTransaction(async transaction => {
      const persona = await transaction.get(personaDocument);
      const personaData = persona.data() as Persona;
      const servicios = personaData.servicios + 1;
      transaction.update(personaDocument, { actualizacion: fecha, salida: fecha, servicios })
    });
  }

  save(data: Persona) {
    const fecha = new Date();
    const ingresoId = moment(fecha).startOf('day').toDate().getTime();
    data.actualizacion = fecha;
    data.id = data.documento;
    const personaDocument = this.angularFirestore.doc(`${this.path}/${data.id}`).ref;
    const pathIngreso = `negocios/${this.usuarioService.usuarioLogueado.idempresa}/ingresos/${ingresoId}`;
    const ingresoDocument = this.angularFirestore.doc(pathIngreso).ref;
    const ingresoPersonaId = this.angularFirestore.createId();
    const ingresoPersonaDocument = this.angularFirestore.doc(`${pathIngreso}/personas/${ingresoPersonaId}`).ref;

    return this.angularFirestore.firestore.runTransaction(async transaction => {
      const persona = await transaction.get(personaDocument);
      const ingreso = await transaction.get(ingresoDocument);
      if (persona.exists) {
        const personaData = persona.data() as Persona;
        data.servicios = personaData.servicios;
        data.salida = null;
        transaction.update(personaDocument, data);
      } else {
        data.servicios = 0;
        transaction.set(personaDocument, data);
      }

      if (ingreso.exists) {
        const ingresos = ingreso.get('ingresos') + 1;
        transaction.update(ingresoDocument, { ingresos, actualizacion: fecha });
      } else {
        transaction.set(ingresoDocument, { ingresos: 1, actualizacion: fecha, id: ingresoId });
      }

      data.id = ingresoPersonaId;
      transaction.set(ingresoPersonaDocument, data);
    });
  }
}
