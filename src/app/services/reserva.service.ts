import { Injectable } from '@angular/core';
import { TotalOptions } from '../interfaces/total-options';
import { ReservaOptions } from '../interfaces/reserva-options';
import { AngularFirestore } from '@angular/fire/firestore';
import moment from 'moment';
import { EstadosReserva } from '../enums/estados-reserva.enum';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  constructor(private angularFirestore: AngularFirestore) { }

  cancelarReserva(reserva: ReservaOptions) {
    reserva.estado = EstadosReserva.CANCELADO;
    const ahora = new Date();
    const fecha = (reserva.fechaInicio instanceof Date ? reserva.fechaInicio : reserva.fechaInicio.toDate()).getTime();
    const idDia = moment(fecha).startOf('day').toDate().getTime();
    const idCancelado = ahora.getTime().toString();
    const disponibilidadDiaDoc = this.angularFirestore.doc(`usuarios/${reserva.usuario.id}/disponibilidades/${idDia}`).ref;
    const reservaDoc = disponibilidadDiaDoc.collection('disponibilidades').doc(fecha.toString());
    const canceladoDoc = disponibilidadDiaDoc.collection('cancelados').doc(idCancelado);
    const disponibilidadClienteDoc = this.angularFirestore.doc(`clientes/${reserva.cliente.id}/citas/${fecha}`).ref;

    return this.angularFirestore.firestore.runTransaction(async transaction => {
      const disponibilidadDiaDocument = await transaction.get(disponibilidadDiaDoc);
      const totales = disponibilidadDiaDocument.data() as TotalOptions;
      const cancelados = totales.cancelados + 1;
      const citas = totales.citas - 1;
      const pendientes = totales.pendientes - 1;

      transaction.update(disponibilidadDiaDoc, { actualizacion: ahora, cancelados, citas, pendientes, usuario: reserva.usuario });
      transaction.set(canceladoDoc, reserva);
      transaction.delete(reservaDoc);
      transaction.update(disponibilidadClienteDoc, reserva);
    });
  }

  disponibilidadDia(usuario: string, fecha: string) {
    const disponibilidadDiaDoc = this.angularFirestore.doc<TotalOptions>(`usuarios/${usuario}/disponibilidades/${fecha}`);
    return disponibilidadDiaDoc.valueChanges();
  }

  reserva(usuario: string, fecha: Date) {
    const idDia = moment(fecha).startOf('day').toDate().getTime();
    const idReserva = fecha.getTime();
    const disponibilidadDiaDoc = this.angularFirestore
      .doc<TotalOptions>(`usuarios/${usuario}/disponibilidades/${idDia}/disponibilidades/${idReserva}`);
    return disponibilidadDiaDoc.ref.get();
  }

  disponibilidadesPendientes(usuario: string) {
    const disponibilidadDiaDoc = this.angularFirestore.collection<TotalOptions>(`usuarios/${usuario}/disponibilidades`, ref =>
      ref.where('pendientes', '>', 0));
    return disponibilidadDiaDoc.valueChanges();
  }

  finalizar(reserva: ReservaOptions) {
    reserva.estado = EstadosReserva.FINALIZADO;
    const fecha = reserva.fechaInicio instanceof Date ? reserva.fechaInicio : reserva.fechaInicio.toDate();
    const idDia = moment(fecha).startOf('day').toDate().getTime().toString();
    const idDisponibilidad = fecha.getTime().toString();
    const disponibilidadDiaDoc = this.angularFirestore.doc(`usuarios/${reserva.usuario.id}/disponibilidades/${idDia}`).ref;
    const reservaDocument = disponibilidadDiaDoc.collection('disponibilidades').doc(idDisponibilidad);
    const reservaClienteDocument = this.angularFirestore.doc(`clientes/${reserva.cliente.id}/citas/${idDisponibilidad}`).ref;

    return this.angularFirestore.firestore.runTransaction(async transaction => {
      const disponibilidadDiaDocument = await transaction.get(disponibilidadDiaDoc);
      const totales = disponibilidadDiaDocument.data() as TotalOptions;
      const citas = totales.citas + 1;
      const pendientes = totales.pendientes - 1;
      const totalReserva = reserva.servicio.map(servicio => servicio.valor).reduce((a, b) => Number(a) + Number(b));
      const total = Number(totales.total) + Number(totalReserva);

      transaction.update(disponibilidadDiaDoc, { actualizacion: new Date(), citas, pendientes, total, usuario: reserva.usuario });
      transaction.update(reservaClienteDocument, reserva);
      transaction.update(reservaDocument, reserva);
      transaction.update(reservaClienteDocument, reserva);
    });
  }

  reservar(reserva: ReservaOptions) {
    reserva.estado = EstadosReserva.RESERVADO;
    const ahora = new Date();
    const fecha = reserva.fechaInicio;
    const idDia = moment(fecha).startOf('day').toDate().getTime().toString();
    const idReserva = fecha.getTime().toString();
    const idUsuario = reserva.usuario.id;
    const disponibilidadDiaDoc = this.angularFirestore.doc(`usuarios/${idUsuario}/disponibilidades/${idDia}`).ref;
    const reservaDoc = disponibilidadDiaDoc.collection('disponibilidades').doc(idReserva);
    const disponibilidadClienteDoc = this.angularFirestore.doc(`clientes/${reserva.cliente.id}/citas/${idReserva}`).ref;

    return this.angularFirestore.firestore.runTransaction(async transaction => {
      const reservaDocument = await transaction.get(reservaDoc);
      if (reservaDocument.exists) {
        Promise.reject('La reserva ya ha sido asingada');
      } else {
        const disponibilidadDiaDocument = await transaction.get(disponibilidadDiaDoc);
        let totales = {} as TotalOptions;
        if (disponibilidadDiaDocument.exists) {
          const pendientes = disponibilidadDiaDocument.data().pendientes + 1;
          transaction.update(disponibilidadDiaDoc, { actualizacion: ahora, pendientes });
        } else {
          totales.actualizacion = ahora;
          totales.id = idDia;
          totales.cancelados = 0;
          totales.citas = 0;
          totales.pendientes = 1;
          totales.total = 0;
          totales.usuario = reserva.usuario;
          transaction.set(disponibilidadDiaDoc, totales);
        }

        transaction.set(reservaDoc, reserva);
        transaction.set(disponibilidadClienteDoc, reserva);
      }
    });
  }

  reservadosDiaEstado(usuario: string, idDia: string, estado: string) {
    const reservaCollection = this.angularFirestore
      .collection<ReservaOptions>(`usuarios/${usuario}/disponibilidades/${idDia}/disponibilidades`, ref =>
        ref.where('estado', '==', estado));
    return reservaCollection.valueChanges();
  }

  reservasDia(usuario: string, idDia: string) {
    const disponibilidadDiaDoc = this.angularFirestore
      .collection<ReservaOptions>(`usuarios/${usuario}/disponibilidades/${idDia}/disponibilidades`);
    return disponibilidadDiaDoc.valueChanges();
  }

  saveDia(usuario: string, fecha: string, totales: TotalOptions) {
    const disponibilidadDiaDoc = this.angularFirestore.doc(`usuarios/${usuario}/disponibilidades/${fecha}`);
    return disponibilidadDiaDoc.set(totales);
  }
}
