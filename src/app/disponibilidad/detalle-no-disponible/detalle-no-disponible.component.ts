import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-detalle-no-disponible',
  templateUrl: './detalle-no-disponible.component.html',
  styleUrls: ['./detalle-no-disponible.component.scss'],
})
export class DetalleNoDisponibleComponent implements OnInit {

  diasSemana = [
    { id: 1, dia: 'Lunes' },
    { id: 2, dia: 'Martes' },
    { id: 3, dia: 'Miércoles' },
    { id: 4, dia: 'Jueves' },
    { id: 5, dia: 'Viernes' },
    { id: 6, dia: 'Sábado' },
    { id: 0, dia: 'Domingo' },
  ];

  fechaMaxima = moment(new Date()).add(1, 'year').locale('es').format('YYYY-MM-DD');
  fechaMinima = moment(new Date()).locale('es').format('YYYY-MM-DD');
  filePathNoDisponible: string;
  id: string;
  noDisponibilidad: any;
  repetir = [];
  todo: FormGroup;
  usuario: string;

  constructor(
    private alertController: AlertController,
    private disponibilidadService: DisponibilidadService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.repetir.push({ id: 10, dia: 'Todos los días' });
    this.repetir.push.apply(this.repetir, this.diasSemana);
    this.loadData();
  }

  cancelar() {
    this.modalController.dismiss();
  }

  compareFn(p1: any, p2: any): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  async genericAlert(titulo: string, mensaje: string) {
    const mensajeAlert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.noDisponibilidad.id],
      fechaDesde: [this.noDisponibilidad.fechaDesde.toISOString(), Validators.required],
      fechaHasta: [this.noDisponibilidad.fechaHasta.toISOString()],
      todoDia: [this.noDisponibilidad.todoDia],
      indefinido: [this.noDisponibilidad.indefinido],
      horaDesde: [this.noDisponibilidad.horaDesde],
      horaHasta: [this.noDisponibilidad.horaHasta],
      repetir: [this.noDisponibilidad.repetir, Validators.required],
      descripcion: [this.noDisponibilidad.descripcion, Validators.required]
    });
  }

  guardar() {
    this.disponibilidadService.saveNoDisponible(this.usuario, this.todo.value).then(() => {
      this.usuarioService.actualizacion(this.usuario);
      this.genericAlert('Horario no disponible', 'Se ha registrado éxitosamente');
    });

    this.modalController.dismiss();
  }

  private loadData() {
    if (!this.id) {
      this.noDisponibilidad = {
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        todoDia: false,
        indefinido: false,
        horaDesde: null,
        horaHasta: null,
        repetir: this.repetir[0],
        descripcion: null
      }

      this.form();
    } else {
      this.disponibilidadService.noDisponible(this.usuario, this.id).subscribe(noDisponible => {
        this.noDisponibilidad = noDisponible;
        this.noDisponibilidad.fechaDesde = new Date(this.noDisponibilidad.fechaDesde);
        this.noDisponibilidad.fechaHasta = new Date(this.noDisponibilidad.fechaHasta);
        this.form();
      });
    }
  }

  validarIndefinido() {
    if (this.todo.value.indefinido) {
      this.todo.patchValue({
        fechaHasta: null,
        todoDia: false,
        repetir: this.repetir[1]
      });
    } else {
      this.todo.patchValue({
        fechaHasta: this.todo.value.fechaDesde,
        repetir: this.repetir[0]
      });
    }
  }

  validarTodoDia() {
    if (this.todo.value.todoDia) {
      this.todo.patchValue({
        fechaHasta: this.todo.value.fechaDesde,
        horaDesde: null,
        horaHasta: null,
        indefinido: this.todo.value.indefinido,
        repetir: this.repetir[0]
      });
    }
  }

}
