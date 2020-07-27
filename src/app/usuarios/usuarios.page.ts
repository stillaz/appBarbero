import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { ModalController } from '@ionic/angular';
import { DisponibilidadService } from '../services/disponibilidad.service';
import moment from 'moment';
import { ReservaService } from '../services/reserva.service';
import { PerfilOptions } from '../interfaces/perfil-options';
import { UsuarioOptions } from '../interfaces/usuario-options';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  disponibilidad: boolean;
  espera = true;
  fecha: Date;
  items: any[];

  constructor(
    private disponibilidadService: DisponibilidadService,
    private empresaService: EmpresaService,
    private modalController: ModalController,
    private reservaService: ReservaService
  ) { }

  ngOnInit() {
    if (this.fecha) {
      this.updatePerfilesServicio();
    } else {
      this.updateUsuarios();
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }

  private async disponible(usuarios: UsuarioOptions[], perfil: string) {
    const asyncFilter = async (usuarios: UsuarioOptions[], predicate: any) => {
      const results = await Promise.all(usuarios.map(predicate));

      return usuarios.filter((_v, index) => results[index]);
    }

    return await asyncFilter(usuarios, async (usuario: UsuarioOptions) => {
      const perfilUsuario = usuario.perfiles.some(perfilUsuario => perfilUsuario.nombre === perfil);
      if (perfilUsuario && !this.disponibilidad) {
        return !(await this.noDisponible(usuario.id)) && !(await this.reserva(usuario.id));
      } else if (perfilUsuario) {
        return new Promise<boolean>(resolve => resolve(true));
      } else {
        return new Promise<boolean>(resolve => resolve(false));
      }
    });
  }

  private async noDisponible(usuario: string) {
    const indisponibles = await this.disponibilidadService.horarioNoDisponible(usuario);
    const indisponibilidadesData = indisponibles.docs.map(doc => doc.data());
    return indisponibilidadesData.some((item: any) => {
      if (item.repetir.some((itemRepetir: any) => itemRepetir.id === 10 || itemRepetir.id === this.fecha.getDay())) {
        const fechaDesde: Date = moment(new Date(item.fechaDesde)).startOf('day').toDate();
        const fechaFin: Date = item.indefinido ? moment(this.fecha).endOf('day').toDate() : moment(new Date(item.fechaHasta)).endOf('day').toDate();
        const fechaEncontrada = moment(this.fecha).isBetween(fechaDesde, fechaFin);
        const fechaHoraEncontrada = moment(this.fecha).isBetween(new Date(item.fechaDesde), new Date(item.fechaHasta));
        return (fechaEncontrada && item.todoDia) || fechaHoraEncontrada;
      }

      return false;
    });
  }

  private async reserva(usuario: string) {
    return (await this.reservaService.reserva(usuario, this.fecha)).exists;
  }

  private async perfilesServicios(perfiles: PerfilOptions[]) {
    const asyncFilter = async (perfiles: PerfilOptions[], predicate: any) => {
      const results = await Promise.all(perfiles.map(predicate));
      return perfiles.filter((_v, index) => results[index]);
    }

    return await asyncFilter(perfiles, async (perfil: PerfilOptions) => {
      return !(await this.empresaService.serviciosGrupos(perfil.grupo)).empty;
    });
  }

  seleccionar(usuario: UsuarioOptions) {
    this.modalController.dismiss(usuario);
  }

  private updatePerfilesServicio() {
    this.empresaService.perfiles().subscribe(async perfiles => {
      const perfilesServicios = await this.perfilesServicios(perfiles);
      this.updateUsuarios(perfilesServicios.map(perfil => perfil.nombre));
    });
  }

  private updateUsuarios(perfiles?: string[]) {
    this.empresaService.usuarios().subscribe(usuarios => {
      this.items = [];

      if (perfiles) {
        perfiles.forEach(async (perfil, index) => {
          const usuariosDisponible = await this.disponible(usuarios, perfil);
          if (usuariosDisponible[0]) {
            this.items.push({ perfil, usuarios: usuariosDisponible });
            if (index === perfiles.length - 1) {
              this.espera = false;
            }
          }
        });
      }
    });
  }

}
