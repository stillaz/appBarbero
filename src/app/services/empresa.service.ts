import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UsuarioOptions } from '../interfaces/usuario-options';
import { UsuarioService } from './usuario.service';
import { ServicioOptions } from '../interfaces/servicio-options';
import { PerfilOptions } from '../interfaces/perfil-options';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private path: string;

  constructor(private angularFirestore: AngularFirestore, private usuarioService: UsuarioService) {
    this.path = `negocios/${this.usuarioService.usuarioLogueado.idempresa}`;
  }

  perfiles(perfiles?: string[]) {
    const usuarioCollection = this.angularFirestore.collection<PerfilOptions>(`${this.path}/perfiles`, ref => {
      return perfiles ? ref.where('nombre', 'in', perfiles) : ref;
    });
    return usuarioCollection.valueChanges();
  }

  serviciosGrupos(grupos: string[]) {
    const serviciosCollection = this.angularFirestore.collection<ServicioOptions>(`${this.path}/servicios`);
    return serviciosCollection.ref.where('grupo', 'array-contains-any', grupos).orderBy('nombre').get();
  }

  usuarios() {
    const usuarioCollection = this.angularFirestore
      .collection<UsuarioOptions>('usuarios', ref => {
        return ref.where('idempresa', '==', this.usuarioService.usuarioLogueado.idempresa).orderBy('nombre');
      });
    return usuarioCollection.valueChanges();
  }
}
