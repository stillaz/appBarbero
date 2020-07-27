import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UsuarioService } from './usuario.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private angularFireAuth: AngularFireAuth, private router: Router, private usuarioService: UsuarioService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.usuarioService.currentUser && true;
  }

  login() {
    this.angularFireAuth.user.subscribe(user => {
      if (user) {
        this.usuarioService.currentUser = user;
        this.usuarioService.usuario(user.uid).subscribe(usuario => {
          this.usuarioService.usuarioLogueado = usuario;
          this.usuarioService.administrador = usuario.perfiles.map(perfil => perfil.nombre === 'Administrador').reduce((a, b) => a || b);
          this.router.navigate(['tabs/agenda']);
        });
      } else {
        this.router.navigate(['logueo']);
      }
    });
  }
}
