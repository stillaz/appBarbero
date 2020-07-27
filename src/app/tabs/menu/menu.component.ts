import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MenuController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  pages = [
    { title: 'Horario', path: '/horario', icon: 'timer' },
    { title: 'Perfil', path: '/perfil', icon: 'person' },
    { title: 'Ingreso de personas', path: '/personas/registro', icon: 'people' }
  ];
  usuario: UsuarioOptions;

  constructor(private angularFireAuth: AngularFireAuth, private menuController: MenuController, private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.usuario = this.usuarioService.usuarioLogueado;
  }

  async salir() {
    const menu = await this.menuController.getOpen();
    menu.close();
    this.angularFireAuth.signOut();
  }

}
