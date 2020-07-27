import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import moment from 'moment';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {

  public monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  public dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  public hoy = new Date();
  public fecha: Date;
  public min: Date;
  public max: Date;

  constructor(
    public modalController: ModalController,
    public navParams: NavParams
  ) { }

  ngOnInit() {
    this.fecha = this.navParams.get('fecha') || this.hoy;
    this.min = this.navParams.get('antes') ? null : moment(this.hoy).startOf('day').toDate();
    const meses = this.navParams.get('max') || 1;
    this.max = this.navParams.get('antes') ? moment(this.hoy).endOf('day').toDate() : moment(this.hoy).add(meses, 'month').toDate();
  }

  public seleccionar(event: Date) {
    this.fecha = event;
  }

  public continuarHoy() {
    this.modalController.dismiss({
      fecha: this.hoy
    });
  }

  public continuar() {
    this.modalController.dismiss({
      fecha: this.fecha
    });
  }

  public cancelar() {
    this.modalController.dismiss();
  }

}
