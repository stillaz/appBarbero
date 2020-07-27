import { Component, OnInit } from '@angular/core';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-notificacion',
  templateUrl: './detalle-notificacion.component.html',
  styleUrls: ['./detalle-notificacion.component.scss'],
})
export class DetalleNotificacionComponent implements OnInit {

  notificacionId: string;
  usuario: string;
  notificacion: any;

  constructor(private modalController: ModalController, private notificacionService: NotificacionService) { }

  ngOnInit() { }

  cerrar() {
    this.modalController.dismiss();
  }

  updateNotificacion() {
    this.notificacionService.notificacionUsuario(this.notificacionId, this.usuario).subscribe(notificacion => {
      this.notificacion = notificacion;
    });
  }

}
