import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController, LoadingController, ModalController, NavController, Platform, ToastController, IonItemSliding } from '@ionic/angular';
import { EstadosReserva } from '../enums/estados-reserva.enum';
import { ReservaOptions } from '../interfaces/reserva-options';
import { UsuarioOptions } from '../interfaces/usuario-options';
import { interval } from 'rxjs';
import moment from 'moment';
import { ServicioOptions } from '../interfaces/servicio-options';
import { CalendarioPage } from '../calendario/calendario.page';
import { Eventos } from '../enums/eventos.enum';
import { UsuarioService } from '../services/usuario.service';
import { ReservaService } from '../services/reserva.service';
import { ServicioService } from 'src/app/services/servicio.service';
import { MensajeOptions } from 'src/app/interfaces/mensaje-options';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { EstadosNotificacion } from 'src/app/enums/estados-notificacion.enum';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { UsuariosPage } from '../usuarios/usuarios.page';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  public estadosReserva = EstadosReserva;
  public fecha = new Date();
  private horaFin = 24;
  public horario: ReservaOptions[];
  public horarios: any[];
  private indisponibles: any;
  private horaInicio = 0;
  public terms = '';
  private tiempoServicio = 30;
  public usuario: UsuarioOptions;

  constructor(
    private alertController: AlertController,
    private disponibilidadService: DisponibilidadService,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
    private navController: NavController,
    private notificacionService: NotificacionService,
    private platform: Platform,
    private reservaService: ReservaService,
    private servicioService: ServicioService,
    private toastController: ToastController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
    this.updateHorarioUsuario(this.loginService.currentUser.uid);
    interval(60000).subscribe(() => {
      this.fecha = new Date();
      this.updateHorario();
    });
  }

  async cancelar(slidingItem: IonItemSliding, reserva: ReservaOptions) {
    slidingItem.close();
    const textoFecha = moment(reserva.fechaInicio).locale("es").calendar();
    const alert = await this.alertController.create({
      header: 'Cancelar servicio',
      message: `¿Está seguro de cancelar la cita de ${textoFecha}?`,
      buttons: [{
        text: 'Si',
        handler: () => {
          this.procesarCancelacion(reserva);
        }
      }, {
        text: 'No',
        role: 'cancel'
      }]
    });

    await alert.present();
  }

  private async hayServicios() {
    const gruposPerfil = this.usuario.perfiles.filter(perfil => perfil.grupo)
      .map(perfil => perfil.grupo.reduce(grupos => grupos));
    return !(await this.servicioService.serviciosGrupos(this.usuario.idempresa, gruposPerfil)).empty;
  }

  private loadHorarioNoDisponible(fecha: Date) {
    const encontrado = this.indisponibles.find((item: any) => {
      if (item.repetir.some((itemRepetir: any) => itemRepetir.id === 10 || itemRepetir.id === fecha.getDay())) {
        const fechaDesde: Date = moment(new Date(item.fechaDesde)).startOf('day').toDate();
        const fechaFin: Date = item.indefinido ? moment(fecha).endOf('day').toDate() : moment(new Date(item.fechaHasta)).endOf('day').toDate();
        if (moment(fecha).isBetween(fechaDesde, fechaFin)) {
          const horaInicio = item.todoDia ? this.horaInicio : moment(new Date(item.horaDesde)).startOf('hour').toDate().getHours();
          const horaFin = item.todoDia ? this.horaFin : moment(new Date(item.horaHasta)).endOf('hour').toDate().getHours();
          const horaReserva = fecha.getHours();
          if (horaReserva >= horaInicio && horaReserva < horaFin) {
            return item;
          }
        }
      }
    });

    if (encontrado) {
      const servicio = {} as ServicioOptions;
      servicio.nombre = encontrado.descripcion;
      return servicio;
    }

    return null;
  }

  private notificarCancelacion(reserva: ReservaOptions) {
    const cliente = reserva.cliente;
    const usuario = reserva.usuario;
    const token = cliente.token;
    const fechaMensaje = moment(reserva.fechaInicio).locale('es').format('LLLL');
    const mensaje: MensajeOptions = {
      fecha: new Date().getTime().toString(),
      data: {
        id: this.notificacionService.crearId(),
        info: reserva.id,
        modo: EstadosNotificacion.CANCELA_CITA
      },
      mensaje: {
        body: `${usuario.nombre} ha cancelado la cita de ${fechaMensaje}.`,
        title: 'Cita cancelada',
      },
      token: token
    };

    this.notificacionService.notificar(mensaje, cliente.id);
  }

  private async presentAlert(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'OK'
      }]
    });
    alert.present();
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se ha cancelado la reserva',
      duration: 3000
    });

    toast.present();
  }

  private async procesarCancelacion(reserva: ReservaOptions) {
    const loading = await this.loadingController.create({
      message: 'Cancelando la reserva',
      duration: 20000
    });

    loading.present();
    this.reservaService.cancelarReserva(reserva).then(() => {
      if (reserva.id) {
        this.notificarCancelacion(reserva);
      }
      this.presentToast();
    }).catch(err => {
      this.presentAlert('Error al cancelar cita', `Se ha presentado un error al cancelar la cita. Error: ${err}`);
    }).finally(() => {
      loading.dismiss();
    });
  }

  reservar(reserva: ReservaOptions) {
    if (this.loginService.administrador) {
      this.usuarios(reserva);
    } else {
      this.verificarDataUsuario().then(() => {
        this.navController
          .navigateForward(`reserva/${this.usuario.id}/${reserva.fechaInicio.getTime()}/${reserva.fechaFin.getTime()}`);
      }).catch(err => {
        this.presentAlert(err[0], err[1]);
      });
    }
  }

  private scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = element.offsetTop;
      this.content.scrollToPoint(0, yOffset - 50, 1000);
    }
  }

  async seleccionarFecha() {
    const modal = await this.modalController.create({
      component: CalendarioPage,
      componentProps: {
        fecha: this.fecha
      }
    });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        this.fecha = data.fecha;
        this.updateHorario();
      }
    });

    await modal.present();
  }

  private updateHorario() {
    const fecha = moment(this.fecha).startOf('days').toDate().getTime().toString();
    this.reservaService.reservasDia(this.usuario.id, fecha).subscribe(data => {
      this.horario = [];
      this.horarios = [];
      const grupos = [];
      const reservas: ReservaOptions[] = data;
      const ahora = new Date();
      let fechaInicio = moment(this.fecha).startOf('day').hours(this.horaInicio);
      const fechaFin = moment(this.fecha).hours(this.horaFin);
      while (fechaInicio.isSameOrBefore(fechaFin.toDate())) {
        const fechaInicioReserva = fechaInicio.toDate();
        const fechaFinReserva = moment(fechaInicio).add(this.tiempoServicio, 'minutes').toDate();
        const noDisponible = this.loadHorarioNoDisponible(fechaInicioReserva);
        let reserva: ReservaOptions;
        if (noDisponible) {
          reserva = {
            fechaInicio: fechaInicioReserva,
            fechaFin: fechaFinReserva,
            estado: EstadosReserva.NO_DISPONIBLE,
            evento: Eventos.OTRO,
            cliente: {} as UsuarioOptions,
            servicio: [noDisponible],
            usuario: this.usuario,
          } as ReservaOptions;
        } else {
          const reservaEnc = reservas.find(item => {
            const fechaReserva = item.fechaInicio instanceof Date ? item.fechaInicio : item.fechaInicio.toDate();
            return fechaReserva.getTime() === fechaInicioReserva.getTime();
          });
          if (reservaEnc) {
            reserva = reservaEnc;
            reserva.fechaInicio = reservaEnc.fechaInicio.toDate();
            reserva.fechaFin = reservaEnc.fechaFin.toDate();
          } else {
            reserva = {
              fechaInicio: fechaInicioReserva,
              fechaFin: fechaFinReserva,
              estado: EstadosReserva.DISPONIBLE,
              evento: Eventos.OTRO,
              cliente: {} as UsuarioOptions,
              servicio: [],
              usuario: this.usuario,
              fechaActualizacion: ahora
            } as ReservaOptions;
          }
        }

        if (moment(ahora).isBetween(reserva.fechaInicio, reserva.fechaFin)) {
          reserva.evento = Eventos.ACTUAL;
          if (reserva.estado === EstadosReserva.RESERVADO) {
            reserva.estado = EstadosReserva.EJECUTANDO;
          }
        }

        const grupo = moment(reserva.fechaInicio).startOf('hours').format('h:mm a');;
        if (grupos[grupo] === undefined) {
          grupos[grupo] = [];
        }
        grupos[grupo].push(reserva);

        this.horario.push(reserva);
        fechaInicio = moment(reserva.fechaFin);
      }

      for (let grupo in grupos) {
        this.horarios.push({ grupo: grupo, disponibilidad: grupos[grupo] });
      }

      const horaAhora = ahora.getHours();

      if (horaAhora >= this.horaInicio && horaAhora <= this.horaFin && moment(ahora).diff(fechaInicio, 'days') === 0) {
        setTimeout(() => {
          this.scrollTo(Eventos.ACTUAL);
        }, 500);
      }
    });
  }

  updateHorarioNoDisponible() {
    this.disponibilidadService.indisponibilidades(this.usuario.id).subscribe(indisponibilidades => {
      this.indisponibles = indisponibilidades;
      this.updateHorario();
    });
  }

  private async updateHorarioUsuario(idUsuario: string) {
    this.usuarioService.usuario(idUsuario).subscribe(usuario => {
      this.usuario = usuario;

      const configuracion = this.usuario.configuracion;
      if (configuracion) {
        this.horaInicio = configuracion.horaInicio;
        this.horaFin = configuracion.horaFin;
        this.tiempoServicio = configuracion.tiempoDisponibilidad;
      }

      this.updateHorarioNoDisponible();
    });
  }

  private async usuarios(reserva: ReservaOptions) {
    const modal = await this.modalController.create({
      component: UsuariosPage,
      componentProps: {
        fecha: reserva.fechaInicio
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data) {
        modal.remove();
        this.navController
          .navigateForward(`reserva/${res.data.id}/${reserva.fechaInicio.getTime()}/${reserva.fechaFin.getTime()}`);
      }
    });

    modal.present();
  }

  private verificarDataUsuario() {
    return new Promise(async (resolve, reject) => {
      if (!this.usuario) {
        reject(['Usuario no existe', 'El usuario no existe en la base de datos']);
      } else if (!this.usuario.perfiles || !this.usuario.perfiles[0]) {
        reject(['Usuario sin perfil', 'El usuario no tiene ningún perfil asignado']);
      } else if (!await this.hayServicios()) {
        reject(['Usuario sin servicios', 'El usuario no tiene ningún servicio asignado']);
      } else {
        resolve();
      }
    });
  }

}
