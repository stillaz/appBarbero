import { Component, OnInit } from '@angular/core';
import { ReservaOptions } from 'src/app/interfaces/reserva-options';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-cita',
  templateUrl: './detalle-cita.component.html',
  styleUrls: ['./detalle-cita.component.scss'],
})
export class DetalleCitaComponent implements OnInit {

  public cita: ReservaOptions;
  public empresa: any;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  public cerrar() {
    this.modalController.dismiss();
  }

}
