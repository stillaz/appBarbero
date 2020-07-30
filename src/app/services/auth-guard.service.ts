import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UsuarioService } from './usuario.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';
import { LoginService } from './login.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private angularFireAuth: AngularFireAuth, private loginService: LoginService, private navController: NavController, private usuarioService: UsuarioService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.loginService.currentUser && true;
  }

  login() {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        this.loginService.currentUser = user;
        this.usuarioService.usuario(user.uid).subscribe(usuario => {
          this.loginService.usuario = usuario;
          this.loginService.administrador = usuario.perfiles.map(perfil => perfil.nombre === 'Administrador').reduce((a, b) => a || b);
          this.navController.navigateRoot('tabs/agenda');
        });
      } else {
        this.navController.navigateRoot('logueo');
      }
    });
  }
}
