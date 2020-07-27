import { Component, OnInit } from '@angular/core';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { ServicioOptions } from 'src/app/interfaces/servicio-options';
import { TotalOptions } from 'src/app/interfaces/total-options';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import moment from 'moment';
import { ReservaOptions } from 'src/app/interfaces/reserva-options';
import { PaqueteOptions } from 'src/app/interfaces/paquete-options';
import { DetalleClienteComponent } from './detalle-cliente/detalle-cliente.component';
import { ReservaService } from 'src/app/services/reserva.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EmpresaService } from '../services/empresa.service';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.page.html',
  styleUrls: ['./reserva.page.scss'],
})
export class ReservaPage implements OnInit {

  private cliente: UsuarioOptions;
  private fecha: Date;
  private fechaInicio: Date;
  idusuario: string;
  public servicios: ServicioOptions[];
  private usuario: UsuarioOptions;
  private totales: TotalOptions;
  private ventana = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private empresaService: EmpresaService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private navController: NavController,
    private reservaService: ReservaService,
    private toastController: ToastController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.modalController.getTop().then(modal => {
      if (modal) {
        this.ventana = true;
        this.updateUsuario();
      } else {
        const params = this.activatedRoute.snapshot.paramMap;
        const fechaInicio = params.get('fechaInicio');
        const usuario = params.get('usuario');
        this.fechaInicio = new Date(Number(fechaInicio));
        this.idusuario = usuario;
        this.fecha = moment(this.fechaInicio).startOf('day').toDate();
        this.updateUsuario();
        this.updateHorario();
        this.presentCliente();
      }
    });
  }

  private async presentCliente() {
    const modal = await this.modalController.create({ component: DetalleClienteComponent });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        this.cliente = data.cliente;
        this.reservar();
      } else {
        this.navController.pop();
      }
    });

    await modal.present();
  }

  private updateUsuario() {
    this.usuarioService.usuario(this.idusuario).subscribe(async usuario => {
      if (usuario) {
        this.usuario = usuario;
        const perfiles = usuario.perfiles.map(perfil => perfil.nombre);
        this.updateServiciosPerfil(perfiles);
      } else {
        this.presentAlert('Usuario no existe', 'El usuario no existe en la base de datos');
      }
    });
  }

  private async updateServiciosPerfil(perfiles: string[]) {
    this.empresaService.perfiles(perfiles).subscribe(async perfiles => {
      const grupos = perfiles.map(perfil => perfil.grupo.reduce(grupo => grupo));
      const data = (await this.empresaService.serviciosGrupos(grupos));
      if(data){
        this.servicios = data.docs.map(servicio => servicio.data() as ServicioOptions);
      } else {
        this.presentAlert('Usuario sin servicios', 'El usuario no tiene servicios asignados');
      }
    });
  }

  private updateHorario() {
    const idFecha = this.fecha.getTime().toString();
    this.reservaService.disponibilidadDia(this.idusuario, idFecha).subscribe(horario => {
      if (!horario) {
        this.totales = {
          actualizacion: new Date(),
          cancelados: 0,
          citas: 0,
          id: idFecha,
          pendientes: 0,
          total: 0,
          usuario: this.usuario
        }
        this.reservaService.saveDia(this.idusuario, idFecha, this.totales);
      }

      this.totales = horario;
    });
  }

  private async presentAlert(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navController.pop();
        }
      }]
    });

    await alert.present();
  }

  public async reservar(servicio?: ServicioOptions) {
    if (this.ventana) {
      this.modalController.dismiss(servicio);
    } else {
      const loading = await this.loadingController.create({
        message: 'Registrando la reserva',
        duration: 20000
      });

      loading.onDidDismiss().then(() => {
        this.navController.pop();
      });

      loading.present();

      const tiempo = servicio ? servicio.duracion_MIN : this.usuario.configuracion.tiempoDisponibilidad;
      const fechaFin = moment(this.fechaInicio).add(tiempo, 'minutes').toDate();

      const reserva = {
        actualiza: 'usuario',
        cliente: this.cliente,
        fechaActualizacion: new Date(),
        fechaFin: fechaFin,
        fechaInicio: this.fechaInicio,
        paquete: {} as PaqueteOptions,
        servicio: servicio ? [servicio] : [],
        usuario: this.usuario
      } as ReservaOptions;

      this.reservaService.reservar(reserva).then(() => {
        this.presentToast();
        this.navController.pop();
      }).catch(err => {
        this.presentAlert(
          'Error al reservar cita',
          `Se ha presentado un error al reservar la cita. Error: ${err}`);
      }).finally(() => {
        loading.dismiss();
      });
    }
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se ha realizado la reserva',
      duration: 3000
    });

    toast.present();
  }

}
