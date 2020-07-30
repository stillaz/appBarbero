import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { ActivatedRoute } from '@angular/router';
import { ReservaService } from 'src/app/services/reserva.service';
import moment from 'moment';
import { ReservaOptions } from 'src/app/interfaces/reserva-options';
import { UsuarioService } from 'src/app/services/usuario.service';
import { IonSelect } from '@ionic/angular';
import { EstadosReserva } from 'src/app/enums/estados-reserva.enum';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-detalle-reporte',
  templateUrl: './detalle-reporte.component.html',
  styleUrls: ['./detalle-reporte.component.scss'],
})
export class DetalleReporteComponent implements OnInit {

  @ViewChild(IonSelect, { static: false }) select: IonSelect;

  adelante: boolean = false;
  atras: boolean = true;
  cantidad: number;
  disponibilidades: any[];
  filtro: any;
  modo: string = 'reservas';
  total: number;
  usuario: UsuarioOptions;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private reservaService: ReservaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.filtro = {};
      const usuario = params.get('usuario');
      if (usuario) {
        this.updateUsuarioReservas(usuario);
      } else {
        this.updateUsuarioReservas(this.loginService.currentUser.uid);
      }
    });
  }

  irA(valor: 1 | -1) {
    this.filtro.data = moment(this.filtro.data).add(valor, 'months').toDate();
  }

  compareWithFn = (o1: Date, o2: Date) => {
    return o1 && o2 ? moment(o1).diff(o2, 'days') === 0 : o1 === o2;
  };

  onFiltro() {
    if (this.usuario) {
      this.cantidad = 0;
      this.total = 0;
      switch (this.modo) {
        case 'reservas':
          this.updateReservas(this.filtro.data);
          break;
        case 'cancelados':
          this.updateReservas(this.filtro.data);
          break;
      }
    } else {
      setTimeout(() => {
        this.onFiltro();
      }, 500);
    }
  }

  seleccionarMes(fechaSeleccionada: Date) {
    const ahora = moment(new Date());
    this.adelante = ahora.diff(fechaSeleccionada, 'month') !== 0;
    const titulo = moment(fechaSeleccionada).locale("es").format("MMMM YYYY").toLocaleUpperCase();;
    this.filtro.data = fechaSeleccionada;
    this.filtro.titulo = titulo.toLocaleUpperCase();
    let items = this.filtro.items;
    if (!items || !items[0]) {
      this.filtro.items = [];
      const mesInicio = ahora.add(-1, "years");
      let mesIndex = moment(fechaSeleccionada);
      while (mesIndex.isSameOrAfter(mesInicio)) {
        const titulo = mesIndex.locale("es").format("MMMM YYYY").toLocaleUpperCase();
        this.filtro.items.push({ fecha: mesIndex.toDate(), titulo: titulo });
        mesIndex = mesIndex.add(-1, "month");
      }
    }

    this.onFiltro();
  }

  private async updateReservas(fecha: Date) {
    this.cantidad = 0;
    this.disponibilidades = [];
    this.total = 0;
    const ahora = moment(new Date());
    const diaInicio = moment(fecha).startOf('month');
    const diaFin = ahora.diff(fecha, 'day') === 0 ? ahora : moment(fecha).endOf('month');
    let diaIndex = diaFin;
    while (diaIndex.isSameOrAfter(diaInicio)) {
      const dia = diaIndex.startOf('day').toDate().getTime().toString();
      const reservas = (await this.updateReservasDia(this.usuario.id, dia))
        .filter(reserva => reserva.estado === EstadosReserva.FINALIZADO);
      if (reservas[0]) {
        reservas.sort((a, b) => a.fechaInicio < b.fechaInicio ? 1 : a.fechaInicio > b.fechaInicio ? -1 : 0);
        const grupo = diaIndex.locale('es').format('dddd, DD');
        this.disponibilidades.push({ grupo: grupo, disponibilidades: reservas });
        this.total += reservas.map(reserva => Number(reserva.servicio[0].valor)).reduce((a, b) => a + b);
        this.cantidad += reservas.length;
      }

      diaIndex = diaIndex.add(-1, 'day');
    }
  }

  updateReservasDia(usuario: string, idDia: string) {
    return new Promise<ReservaOptions[]>(resolve => {
      this.reservaService.reservasDia(usuario, idDia).subscribe(reservas => {
        resolve(reservas);
      });
    });
  }

  updateUsuarioReservas(idUsuario: string) {
    this.usuarioService.usuario(idUsuario).subscribe(usuario => {
      this.usuario = usuario;
      this.seleccionarMes(new Date());
    });
  }

}
