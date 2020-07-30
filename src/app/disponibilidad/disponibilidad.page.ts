import { Component, OnInit } from '@angular/core';
import { ConfiguracionOptions } from 'src/app/interfaces/configuracion-options';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { DetalleNoDisponibleComponent } from './detalle-no-disponible/detalle-no-disponible.component';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import moment from 'moment';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-disponibilidad',
  templateUrl: './disponibilidad.page.html',
  styleUrls: ['./disponibilidad.page.scss'],
})
export class DisponibilidadPage implements OnInit {

  diasSemana = [
    { id: 0, dia: 'Lunes' },
    { id: 1, dia: 'Martes' },
    { id: 2, dia: 'Miércoles' },
    { id: 3, dia: 'Jueves' },
    { id: 4, dia: 'Viernes' },
    { id: 5, dia: 'Sábado' },
    { id: 6, dia: 'Domingo' },
  ];

  configuracion: ConfiguracionOptions;
  noDisponibles: any[];
  todo: FormGroup;
  usuario: UsuarioOptions;

  constructor(
    private alertController: AlertController,
    private disponibilidadService: DisponibilidadService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private modalController: ModalController,
    private navController: NavController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.updateUsuario(this.loginService.currentUser.uid);
  }

  cancelar() {
    this.navController.pop();
  }

  compareFn(p1: any, p2: any): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  eliminar(noDisponible: string) {
    this.disponibilidadService.eliminar(this.usuario.id, noDisponible);
  }

  private form() {
    this.todo = this.formBuilder.group({
      horaInicio: [this.configuracion.horaInicio, Validators.compose([Validators.required, Validators.min(0), Validators.max(24)])],
      horaFin: [this.configuracion.horaFin, Validators.compose([Validators.required, Validators.min(0), Validators.max(24)]), this.validarFechaFinMayor()],
      tiempoDisponibilidad: [this.configuracion.tiempoDisponibilidad, Validators.compose([Validators.required, Validators.min(1), Validators.max(60)])],
      tiempoAlerta: [this.configuracion.tiempoAlerta, Validators.compose([Validators.required, Validators.min(1), Validators.max(1440)])],
      diasNoDisponible: [this.configuracion.diasNoDisponible]
    });
  }

  async genericAlert(titulo: string, mensaje: string) {
    let mensajeAlert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  async guardar() {
    this.configuracion = this.todo.value;

    const alert = await this.alertController.create({
      header: 'Actualizar horario',
      message: '¿Desea guardar la configuración?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Si',
        handler: () => {
          this.usuario.configuracion = this.configuracion;
          this.usuarioService.saveHorario(this.usuario.id, this.configuracion).then(() => {
            this.genericAlert('Actualizar horario', 'Horario actualizado');
            this.navController.pop();
          }).catch(() => this.genericAlert('Actualizar horario', 'Se presentó un error al guardar, intentar nuevamente.'));
        }
      }]
    });

    alert.present();
  }

  private isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
  }

  private updateNoDisponible() {
    this.disponibilidadService.indisponibilidades(this.usuario.id).subscribe(noDisponibles => {
      this.noDisponibles = noDisponibles;
      this.noDisponibles.forEach(noDisponible => {
        let mensaje = `Desde ${moment(new Date(noDisponible.fechaDesde)).locale('es').calendar().replace(/a las (([0-9]{2}:[0-9]{2})|[0-9]2)/, '')}`;
        mensaje += ` ${noDisponible.todoDia ? 'todo el día' : ' desde ' + moment(new Date(noDisponible.horaDesde)).locale('es').format('hh a') + ' a ' + moment(new Date(noDisponible.horaHasta)).locale('es').format('hh a')}`;
        mensaje += noDisponible.indefinido ? ' indefinido' :
          ` hasta ${moment(new Date(noDisponible.fechaHasta)).locale('es').calendar().replace(/a las (([0-9]{2}:[0-9]{2})|[0-9]2)/, '')}`;

        let mensajeRepetir: string;
        const repetir = noDisponible.repetir;
        const todosDias = repetir && repetir.find((item: any) => item.id === 10);
        if (todosDias) {
          mensajeRepetir = `Repetición: ${todosDias.dia}`;
        } else {
          const repetirA = repetir && noDisponible.repetir.map((item: any) => item.dia);
          mensajeRepetir = `Repetición: ${repetirA.join(', ')}`;
        }

        noDisponible.mensaje = `${mensaje.trim()}. ${mensajeRepetir}`
      });
    });
  }

  private updateUsuario(usuarioId: string) {
    this.usuarioService.usuario(usuarioId).subscribe(usuario => {
      this.usuario = usuario;
      this.configuracion = usuario.configuracion ? usuario.configuracion : {} as ConfiguracionOptions;
      this.form();
      this.updateNoDisponible();
    });
  }

  private validarFechaFinMayor() {
    return (control: AbstractControl): { [key: string]: any } => {
      if (this.isPresent(Validators.required(control))) return null;

      const fin = control.value;
      const inicio = this.todo && this.todo.value.horaInicio ? this.todo.value.horaInicio : 9999999999999;

      return new Promise((resolve) => {
        resolve(Number(fin) <= Number(inicio) ? { validarFechaFinMayor: true } : null);
      });
    }
  }

  async verNoDisponible(noDisponible?: string) {
    const modal = await this.modalController.create({
      component: DetalleNoDisponibleComponent,
      componentProps: {
        usuario: this.usuario.id,
        id: noDisponible
      }
    });

    modal.present();
  }

}
