import { Component, OnInit } from '@angular/core';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { DetalleNotificacionComponent } from './detalle-notificacion/detalle-notificacion.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.page.html',
  styleUrls: ['./notificacion.page.scss'],
})
export class NotificacionPage implements OnInit {

  private usuario: UsuarioOptions;
  public notificaciones: any[];

  constructor(
    private modalController: ModalController,
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.updateUsuario(this.usuarioService.currentUser.uid);
  }

  public eliminar(notificacion: string) {
    this.notificacionService.eliminar(notificacion, this.usuario.id);
  }

  private updateNotificacionesUsuario() {
    this.notificacionService.notificacionesUsuario(this.usuario.id).subscribe(notificaciones => {
      this.notificaciones = notificaciones;
    });
  }

  private updateUsuario(usuario: string) {
    this.usuarioService.usuario(usuario).subscribe(usuario => {
      this.usuario = usuario;
      this.updateNotificacionesUsuario();
    });
  }

  public async ver(notificacion: any) {
    const notificacionId = notificacion.data.id;
    const usuarioId = this.usuario.id;
    this.notificacionService.leido(notificacionId, usuarioId);
    const modal = await this.modalController.create({
      component: DetalleNotificacionComponent,
      componentProps: {
        notificacionId: notificacionId,
        usuario: usuarioId
      }
    });

    modal.present();
  }

}
