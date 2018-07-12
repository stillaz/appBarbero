import moment from 'moment';
import { Component } from '@angular/core';
import { AlertController, IonicPage, ModalController, NavParams, PopoverController, ViewController, NavController } from 'ionic-angular';
import * as DataProvider from '../../providers/constants';
import { ServicioOptions } from '../../interfaces/servicio-options';
import { ClienteOptions } from '../../interfaces/cliente-options';
import { ReservaOptions } from '../../interfaces/reserva-options';
import { UsuarioOptions } from '../../interfaces/usuario-options';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { IndiceOptions } from '../../interfaces/indice-options';
import { DisponibilidadOptions } from '../../interfaces/disponibilidad-options';

/**
 * Generated class for the ReservaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reserva',
  templateUrl: 'reserva.html',
})

export class ReservaPage {

  cantidad = 0;
  totalServicios: number = 0;
  ultimoHorario: Date;
  carrito: ReservaOptions[] = [];
  disponibilidadSeleccionada: ReservaOptions;
  disponibilidadBloquear: ReservaOptions[] = [];
  horario: ReservaOptions[];
  servicios: ServicioOptions[];
  usuario: UsuarioOptions;
  constantes = DataProvider;
  grupoServicios: any[];
  idcarrito: number;
  usuarioDoc: AngularFirestoreDocument<UsuarioOptions>;
  disponibilidadDoc: AngularFirestoreDocument;
  horaSeleccionada: string;
  tiempoDisponibilidad: number;

  public cliente: ClienteOptions = {
    identificacion: null,
    nombre: null,
    telefono: null,
    correoelectronico: null
  };

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    public popoverCtrl: PopoverController,
    public viewCtrl: ViewController,
    private afs: AngularFirestore
  ) {
    this.disponibilidadSeleccionada = this.navParams.get('disponibilidad');
    this.horaSeleccionada = moment(this.disponibilidadSeleccionada.fechaInicio).locale("es").format("dddd, DD [de] MMMM [de] YYYY [a las] h:mm a")
    this.horario = this.navParams.get('horario');
    this.ultimoHorario = this.disponibilidadSeleccionada.fechaInicio;
    this.usuario = this.navParams.get('usuario');
    this.servicios = [];
    this.updateCarrito();
    this.usuarioDoc = this.afs.doc('usuarios/' + this.usuario.id);
    let fecha = moment(this.ultimoHorario).startOf('day').toDate();
    this.usuarioDoc.valueChanges().subscribe(data => {
      if (data) {
        this.tiempoDisponibilidad = data.configuracion ? data.configuracion.tiempoDisponibilidad : 30;
        data.perfiles.forEach(perfil => {
          this.servicios.push.apply(this.servicios, perfil.servicios);
        });
      }
    });
    this.disponibilidadDoc = this.usuarioDoc.collection('disponibilidades').doc(fecha.getTime().toString());
    let datos: DisponibilidadOptions = {
      dia: fecha.getDate(),
      mes: fecha.getMonth() + 1,
      año: fecha.getFullYear(),
      id: fecha.getTime(),
      cantidadServicios: 0,
      totalServicios: 0,
      idusuario: this.usuario.id,
      imagenusuario: this.usuario.imagen,
      usuario: this.usuario.nombre
    };
    this.disponibilidadDoc.ref.get().then(datosDisp => {
      if (!datosDisp.exists) {
        this.disponibilidadDoc.set(datos);
      }
    });
  }

  ionViewDidLoad() {
    let clienteModal = this.modalCtrl.create('ClientePage');
    clienteModal.onDidDismiss(data => {
      if (data) {
        this.cliente = data;
      } else {
        this.viewCtrl.dismiss();
      }
    });
    clienteModal.present();
    this.updateServicios();
  }

  updateCarrito() {
    if (!this.disponibilidadSeleccionada || !this.disponibilidadSeleccionada.idcarrito) {
      let indiceCarritoDoc = this.afs.doc<IndiceOptions>('indices/idcarrito');

      if (!this.idcarrito) {
        indiceCarritoDoc.ref.get().then(data => {
          if (data.exists) {
            this.idcarrito = data.get('id');
            indiceCarritoDoc.set({ id: this.idcarrito + 1 });
          } else {
            this.idcarrito = 0;
            indiceCarritoDoc.set({ id: 1 });
          }
        });
      }
    }
  }

  updateServicios() {
    let grupos = [];
    this.grupoServicios = [];
    this.servicios.forEach(servicio => {
      let grupo = servicio.grupo;
      if (grupos[grupo] === undefined) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(servicio);
    });

    for (let grupo in grupos) {
      this.grupoServicios.push({ grupo: grupo, servicios: grupos[grupo] });
    }
  }

  genericAlert(titulo: string, mensaje: string) {
    let mensajeAlert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  agregar(servicio: ServicioOptions) {
    const servicioVacio: ServicioOptions = {
      activo: true,
      descripcion: null,
      duracion_MIN: this.tiempoDisponibilidad,
      grupo: null,
      id: null,
      imagen: null,
      nombre: null,
      valor: 0
    }

    let servicioSeleccionado = servicio ? servicio : servicioVacio;
    let disponibilidadBloquear: ReservaOptions[] = [];
    let disponibilidadEncontrada: ReservaOptions;
    let disponible: boolean = true;
    let contador = 0;
    for (let i = 0; i <= Number(Math.ceil(servicioSeleccionado.duracion_MIN / this.tiempoDisponibilidad) - 1); i++) {
      contador = i;
      let horaInicio = moment(this.ultimoHorario).add(i * this.tiempoDisponibilidad, 'minutes').toDate();

      disponibilidadEncontrada = this.horario.find(disponibilidad =>
        disponibilidad.fechaInicio.getTime() === horaInicio.getTime()
      );

      if (!disponibilidadEncontrada || disponibilidadEncontrada.estado !== this.constantes.ESTADOS_RESERVA.DISPONIBLE) {
        disponible = false;
        break;
      } else {
        disponibilidadEncontrada.servicio = [servicioSeleccionado];
        disponibilidadBloquear.push(disponibilidadEncontrada);
      }
    }

    if (disponible || (!disponibilidadEncontrada && contador > 0)) {
      this.disponibilidadBloquear.push.apply(this.disponibilidadBloquear, disponibilidadBloquear);
      this.cantidad++;
      servicioSeleccionado.activo = false;
      this.carrito.push({
        servicio: [servicioSeleccionado],
        fechaInicio: disponibilidadBloquear[0].fechaInicio,
        fechaFin: disponibilidadBloquear[disponibilidadBloquear.length - 1].fechaFin,
        cliente: this.cliente,
        estado: this.constantes.ESTADOS_RESERVA.RESERVADO,
        evento: this.constantes.EVENTOS.OTRO,
        idcarrito: this.idcarrito
      });
      this.ultimoHorario = disponibilidadBloquear[disponibilidadBloquear.length - 1].fechaFin;
      this.totalServicios += Number(servicioSeleccionado.valor);
    } else if (contador === 0) {
      this.genericAlert('Error al reservar', 'La cita se cruza con ' + disponibilidadEncontrada.cliente.nombre + ', la reserva ha sido cancelada');
    } else {
      let fechaInicio = moment(disponibilidadEncontrada.fechaInicio).locale("es").format("dddd, DD [de] MMMM [de] YYYY");
      let horaInicio = moment(disponibilidadEncontrada.fechaInicio).format("hh:mm a");
      let cruceAlert = this.alertCtrl.create({
        title: 'Cruce de cita',
        message: 'La cita ' + fechaInicio + ' a las ' + horaInicio + ' se cruza con la cita de ' + disponibilidadEncontrada.cliente.nombre + '\n ¿Desea continuar con esta reserva?',
        buttons: [
          {
            text: 'NO',
            handler: () => {
              disponibilidadBloquear = [];
              this.genericAlert('Reserva cancelada', 'La reserva con ' + this.cliente.nombre + ' ha sido cancelada');
            }
          },
          {
            text: 'SI',
            handler: () => {
              this.disponibilidadBloquear.push.apply(this.disponibilidadBloquear, disponibilidadBloquear);
              servicioSeleccionado.activo = false;
              this.carrito.push({
                servicio: [servicioSeleccionado],
                fechaInicio: disponibilidadBloquear[0].fechaInicio,
                fechaFin: disponibilidadBloquear[disponibilidadBloquear.length - 1].fechaFin,
                cliente: this.cliente,
                estado: this.constantes.ESTADOS_RESERVA.RESERVADO,
                evento: this.constantes.EVENTOS.OTRO,
                idcarrito: this.idcarrito
              });
              this.cantidad++;
              this.ultimoHorario = disponibilidadBloquear[disponibilidadBloquear.length - 1].fechaFin;
              this.totalServicios += Number(servicioSeleccionado.valor);
            }
          }
        ],
      });
      cruceAlert.present();
    }
  }

  eliminar(servicio: ReservaOptions) {
    this.disponibilidadBloquear = [];
    let item = this.carrito.indexOf(servicio);
    let carrito = this.carrito;
    carrito.splice(item, 1);

    this.carrito = [];
    this.cantidad = 0;
    this.totalServicios = 0;
    this.ultimoHorario = this.disponibilidadSeleccionada.fechaInicio;

    carrito.forEach(servicioAdquirido => {
      this.agregar(servicioAdquirido.servicio[0]);
    });

    servicio.servicio[0].activo = true;
  }

  validarReservaDisponible(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.carrito.forEach(reservaNueva => {
        let reservaDoc: AngularFirestoreDocument<ReservaOptions> = this.disponibilidadDoc.collection('disponibilidades').doc(reservaNueva.fechaInicio.getTime().toString());
        let read = reservaDoc.valueChanges().subscribe(data => {
          if (data) {
            reject('La disponibilidad ' + moment(reservaNueva.fechaInicio).locale('es').format('h:mm a') + ' fue reservada.');
          }
        });
        read.unsubscribe();
        resolve('ok');
      });
    });
  }

  guardar() {
    let batch = this.afs.firestore.batch();
    this.validarReservaDisponible().then(() => {
      this.carrito.forEach(reservaNueva => {
        let reservaDoc: AngularFirestoreDocument<ReservaOptions> = this.disponibilidadDoc.collection('disponibilidades').doc(reservaNueva.fechaInicio.getTime().toString());
        let pendienteDoc = this.usuarioDoc.collection('pendientes').doc(reservaNueva.fechaInicio.getTime().toString());
        batch.set(reservaDoc.ref, reservaNueva);
        batch.set(pendienteDoc.ref, reservaNueva);
      });

      batch.commit().then(() => {
        this.genericAlert('Reserva registrada', 'Se ha registrado la reserva');
        this.navCtrl.pop();
      });
    }).catch(err => {
      this.genericAlert('Error reserva', err);
      this.navCtrl.pop();
    });
  }

  reservarVacio() {
    this.agregar(null);
    this.guardar();
  }

  ver(event) {
    let carritoOptions = this.popoverCtrl.create('CarritoPage', {
      servicios: this.carrito,
      total: this.totalServicios
    });

    carritoOptions.present({
      ev: event
    });

    carritoOptions.onDidDismiss(data => {
      if (data && data.metodo === 'eliminar') {
        this.eliminar(data.servicio);
      } else if (data && data.metodo === 'guardar') {
        this.guardar();
      }
    });
  }

}
