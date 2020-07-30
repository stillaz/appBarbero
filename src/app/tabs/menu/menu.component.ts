import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { LoginService } from 'src/app/services/login.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { Empresa } from 'src/app/interfaces/empresa';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  empresa: Empresa;
  pages = [
    { title: 'Horario', path: '/horario', icon: 'timer' },
    { title: 'Perfil', path: '/perfil', icon: 'person' },
    { title: 'Ingreso de personas', path: '/personas/registro', icon: 'people' }
  ];
  usuario: UsuarioOptions;

  constructor(
    private empresaService: EmpresaService,
    private loginService: LoginService,
    private menuController: MenuController,
  ) { }

  ngOnInit() {
    this.usuario = this.loginService.usuario;
    this.empresaService.empresa().subscribe(empresa => {
      this.empresa = empresa;
    });
  }

  async salir() {
    const menu = await this.menuController.getOpen();
    menu.close();
    this.loginService.logout();
  }

}
