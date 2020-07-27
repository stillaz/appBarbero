import { Component, OnInit } from '@angular/core';
import { PersonaService } from '../services/persona.service';
import { Persona } from '../interfaces/persona';
import { Router } from '@angular/router';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UsuarioOptions } from '../interfaces/usuario-options';
import { UsuarioService } from '../services/usuario.service';
import { ServicioService } from '../services/servicio.service';
import { ReservaPage } from '../reserva/reserva.page';
import { ServicioOptions } from '../interfaces/servicio-options';
import { PaqueteOptions } from '../interfaces/paquete-options';
import { ReservaOptions } from '../interfaces/reserva-options';
import { ReservaService } from '../services/reserva.service';
import { EstadosReserva } from '../enums/estados-reserva.enum';
import moment from 'moment';
import { UsuariosPage } from '../usuarios/usuarios.page';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-persona',
  templateUrl: './persona.page.html',
  styleUrls: ['./persona.page.scss'],
})
export class PersonaPage implements OnInit {

  fecha = new Date();
  opcion = 'ahora';
  personas: Persona[];
  reservas: ReservaOptions[];
  subscripcion: Subscription;
  ventana = false;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private personaService: PersonaService,
    private router: Router,
    private reservaService: ReservaService,
    private servicioService: ServicioService,
    private toastController: ToastController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.modalController.getTop().then(modal => {
      this.ventana = modal && true;
    });

    const usuario = this.usuarioService.usuarioLogueado;
    this.updatePersonas();
  }

  private async hayServicios(usuario: UsuarioOptions) {
    const gruposPerfil = usuario.perfiles.filter(perfil => perfil.grupo)
      .map(perfil => perfil.grupo.reduce(grupos => grupos));
    return (await this.servicioService.serviciosGrupos(usuario.idempresa, gruposPerfil)).docs.map(doc => doc.data());
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

  private async presentServicios(persona: Persona, usuario: UsuarioOptions) {
    const modal = await this.modalController.create({
      component: ReservaPage,
      componentProps: {
        idusuario: usuario.id
      }
    });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        this.procesar(data, persona, usuario);
      }
    })

    modal.present();
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se ha procesado el servicio',
      duration: 3000
    });

    toast.present();
  }

  private async procesar(servicio: ServicioOptions, persona: Persona, usuario: UsuarioOptions) {
    const loading = await this.loadingController.create({
      message: 'Procesando servicio',
      duration: 20000
    });

    loading.present();

    const reservasPersona = this.reservas.filter(reserva => reserva.cliente.telefono === persona.telefono);

    if (!reservasPersona[0]) {
      const fecha = new Date();

      const cliente = {
        id: persona.telefono,
        nombre: persona.nombre,
        telefono: persona.telefono
      } as UsuarioOptions;

      const reserva = {
        actualiza: 'usuario',
        cliente: cliente,
        fechaActualizacion: fecha,
        fechaFin: fecha,
        fechaInicio: fecha,
        paquete: {} as PaqueteOptions,
        servicio: [servicio],
        usuario: usuario
      } as ReservaOptions;

      this.reservaService.reservar(reserva).then(async () => {
        await this.reservaService.finalizar(reserva);
        await this.personaService.salida(persona.id);
        this.presentToast();
      }).catch(err => {
        this.presentAlert(
          'Error al procesar el servicio',
          `Se ha presentado un error al procesar el servicio. Error: ${err}`);
      }).finally(() => {
        loading.dismiss();
      });
    } else {
      Promise.all(reservasPersona.map(reserva => {
        reserva.servicio = [servicio];
        return this.reservaService.finalizar(reserva);
      })).then(async () => {
        await this.personaService.salida(persona.id);
        this.presentToast();
      }).catch(err => {
        this.presentAlert(
          'Error al procesar el servicio',
          `Se ha presentado un error al procesar el servicio. Error: ${err}`);
      }).finally(() => {
        loading.dismiss();
      });;
    }
  }

  registro() {
    this.router.navigate(['personas/registro']);
  }

  servicio(persona: Persona) {
    if (this.usuarioService.administrador) {
      this.usuarios(persona);
    } else {
      this.updatePendientes(this.usuarioService.usuarioLogueado.id);
      this.verificarDataUsuario(this.usuarioService.usuarioLogueado).then(() => {
        this.presentServicios(persona, this.usuarioService.usuarioLogueado);
      }).catch(err => {
        this.presentAlert(err[0], err[1]);
      });
    }
  }

  updatePersonas() {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
    switch (this.opcion) {
      case 'ahora':
        this.subscripcion = this.personaService.personas(this.fecha).subscribe(personas => {
          this.personas = personas.filter(persona => !persona.salida);
        });
        break;

      case 'ingreso':
        this.subscripcion = this.personaService.ingreso(this.fecha).subscribe(personas => {
          this.personas = personas;
        });
        break;

      default:
        this.subscripcion = this.personaService.personas().subscribe(personas => {
          this.personas = personas;
        });
        break;
    }
  }

  private async usuarios(persona: Persona) {
    const modal = await this.modalController.create({
      component: UsuariosPage,
      componentProps: {
        disponibilidad: true,
        fecha: new Date()
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data) {
        modal.remove();
        this.updatePendientes(res.data.id);
        this.presentServicios(persona, res.data);
      }
    });

    modal.present();
  }

  private verificarDataUsuario(usuario: UsuarioOptions) {
    return new Promise((resolve, reject) => {
      if (!usuario) {
        reject(['Error de usuario', 'El usuario no existe']);
      } else if (!usuario.perfiles || !usuario.perfiles[0]) {
        reject(['Error de perfil de usuario', 'El usuario no tiene ningún perfil asignado']);
      } else {
        this.hayServicios(usuario).then(data => {
          if (!data) {
            reject(['Error de servicios de usuario', 'El usuario no tiene ningún servicio asignado']);
          }
          resolve();
        });
      }
    });
  }

  private updatePendientes(usuario: string) {
    const idDia = moment(new Date()).startOf('day').toDate().getTime().toString();
    this.reservaService.reservadosDiaEstado(usuario, idDia, EstadosReserva.RESERVADO)
      .subscribe(dataReservas => {
        this.reservas = dataReservas;
      });
  }

}
