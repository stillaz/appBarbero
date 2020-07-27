import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ModalController, ToastController, IonItemSliding } from '@ionic/angular';
import { ReservaOptions } from 'src/app/interfaces/reserva-options';
import { EstadosReserva } from 'src/app/enums/estados-reserva.enum';
import moment from 'moment';
import { MensajeOptions } from 'src/app/interfaces/mensaje-options';
import { EstadosNotificacion } from 'src/app/enums/estados-notificacion.enum';
import { ServicioOptions } from 'src/app/interfaces/servicio-options';
import { DetalleCitaComponent } from './detalle-cita/detalle-cita.component';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { ReservaService } from 'src/app/services/reserva.service';
import { NotificacionService } from 'src/app/services/notificacion.service';

@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.page.html',
  styleUrls: ['./pendiente.page.scss'],
})
export class PendientePage implements OnInit {

  public grupos: any[];
  private usuario: UsuarioOptions;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private modalController: ModalController,
    private notificacionService: NotificacionService,
    private reservaService: ReservaService,
    private toastController: ToastController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.updatePendientes(this.usuarioService.currentUser.uid);
  }

  private async actualizarData(reserva: ReservaOptions) {
    const loading = await this.loadingController.create({
      message: 'Actualizando servicio...',
      duration: 10000
    });

    loading.present();

    const fecha = new Date();
    reserva.actualiza = 'usuario';
    reserva.fechaActualizacion = fecha;
    this.reservaService.finalizar(reserva).then(async () => {
      if (reserva.id) {
        this.notificarFinalizacion(reserva);
      }
      const toast = await this.toastController.create({
        message: 'La cita ha finalizado correctamente',
        duration: 3000
      });

      loading.dismiss();
      toast.present();
      this.navController.navigateRoot('');
    }).catch(async err => {
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Ha ocurrido un error',
        message: `Se presentó un error al finalizar el servicio. Error: ${err}`,
        buttons: ['Aceptar']
      });

      alert.present();
    });
  }

  public async cancelar(slidingItem: IonItemSliding, reserva: ReservaOptions) {
    slidingItem.close();

    const textoFecha = moment(reserva.fechaInicio.toDate()).locale("es").calendar();
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

  private loadPendientesDia(iddisponibilidad: string) {
    return new Promise<ReservaOptions[]>(resolve => {
      this.reservaService.reservadosDiaEstado(this.usuario.id, iddisponibilidad, EstadosReserva.RESERVADO)
        .subscribe(dataReservas => {
          resolve(dataReservas);
        });
    });
  }

  private notificarCancelacion(reserva: ReservaOptions) {
    const cliente = reserva.cliente;
    const usuario = reserva.usuario;
    const token = cliente.token;
    const fechaMensaje = moment(reserva.fechaInicio.toDate()).locale('es').format('LLLL');
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

  private notificarFinalizacion(reserva: ReservaOptions) {
    const cliente = reserva.cliente;
    const token = cliente.token;
    const fechaMensaje = moment(reserva.fechaInicio.toDate()).locale('es').format('LLLL');
    const mensaje: MensajeOptions = {
      fecha: new Date().getTime().toString(),
      data: {
        id: this.notificacionService.crearId(),
        info: reserva.id,
        modo: EstadosNotificacion.FINALIZA_CITA
      },
      mensaje: {
        body: `La cita de ${fechaMensaje} ha terminado.`,
        title: 'Cita finalizada',
      },
      token: token
    };

    this.notificacionService.notificar(mensaje, cliente.correoelectronico);
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
      this.presentAlert('Error al cancelar cita', `Se ha presentado un error al reservar la cita. Error: ${err}`);
    }).finally(() => {
      loading.dismiss();
    });
  }

  private async updatePendientes(idUsuario: string) {
    this.usuarioService.usuario(idUsuario).subscribe(usuario => {
      this.usuario = usuario;
      this.reservaService.disponibilidadesPendientes(this.usuario.id).subscribe(totales => {
        this.grupos = [];

        totales.forEach((total, index) => {
          const pendientes = [];
          this.loadPendientesDia(total.id).then(reservas => {
            pendientes.push.apply(pendientes, reservas);
            const grupo = moment(Number(total.id)).locale('es').calendar().split(' a las ')[0];
            this.grupos.push({ grupo: grupo, total: total, pendientes: pendientes, index: index });
          });
        });
      });
    });
  }

  public async procesar(reserva: ReservaOptions) {
    const alert = await this.alertController.create({
      header: 'Finalizar el servicio',
      message: '¿Desea finalizar el servicio?',
      buttons: [{
        text: 'Si',
        handler: async () => {
          this.actualizarData(reserva);
        }
      }, 'No']
    });

    alert.present();
  }

  public validarServicio(servicios: ServicioOptions[], tipo: string) {
    return servicios.some(servicio => servicio.grupo.some(grupo => grupo === tipo));
  }

  public async ver(cita: ReservaOptions) {
    const modal = await this.modalController.create({
      component: DetalleCitaComponent,
      componentProps: {
        cita: cita
      }
    });

    modal.present();
  }


}
