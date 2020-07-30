import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import moment from 'moment';
import { ReservaService } from 'src/app/services/reserva.service';
import { TotalOptions } from 'src/app/interfaces/total-options';
import { ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { CalendarioPage } from '../calendario/calendario.page';
import { Router, NavigationEnd } from '@angular/router';
import { Reporte } from '../enums/reporte.enum';
import { EmpresaService } from '../services/empresa.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
})
export class ReportePage implements AfterViewInit, OnInit {

  adelante = false;
  atras = true;
  cantidad: number;
  filtro = {} as any;
  reporteUsuarios: any[];
  total: number;
  totalesUsuarios: TotalOptions[];
  usuarios: UsuarioOptions[];

  constructor(
    private actionSheetController: ActionSheetController,
    private empresaService: EmpresaService,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
    private reservaService: ReservaService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.updateUsuario();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.endsWith('reporte') && this.filtro) {
        this.onFiltro();
      }
    });
  }

  ngAfterViewInit() {
    this.filtro.data = new Date();
    this.filtro.filtro = Reporte.DIARIO;
  }

  compareWithFn = (o1: Date, o2: Date) => {
    return o1 && o2 ? moment(o1).diff(o2, 'days') === 0 : o1 === o2;
  };

  private filtrar(item: string) {
    this.filtro.data = new Date();
    this.filtro.filtro = item;
    if (!this.filtro.items) {
      this.onFiltro();
    }
  }

  async menu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Reporte',
      subHeader: 'Selecciona una opción',
      buttons: [{
        text: Reporte.ANUAL,
        handler: () => {
          this.filtrar(Reporte.ANUAL);
        }
      }, {
        text: Reporte.DIARIO,
        handler: () => {
          this.filtrar(Reporte.DIARIO);
        }
      }, {
        text: Reporte.MENSUAL,
        handler: () => {
          this.filtrar(Reporte.MENSUAL);
        }
      }, {
        text: Reporte.SEMANAL,
        handler: () => {
          this.filtrar(Reporte.SEMANAL);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
      }]
    });

    actionSheet.present();
  }

  onFiltro() {
    if (this.usuarios) {
      this.cantidad = 0;
      this.total = 0;
      this.reporteUsuarios = [];
      this.totalesUsuarios = [];
      this.usuarios.forEach(usuario => {
        switch (this.filtro.filtro) {
          case Reporte.ANUAL:
            this.updateReporte(this.filtro.data, usuario, 'year');
            break;
          case Reporte.DIARIO:
            this.updateReporte(this.filtro.data, usuario, 'days');
            break;
          case Reporte.MENSUAL:
            if (this.filtro.titulo) {
              this.updateReporte(this.filtro.data, usuario, 'months')
            } else {
              this.seleccionarMes(this.filtro.data);
            }
            break;
          case Reporte.SEMANAL:
            if (this.filtro.titulo) {
              this.updateReporte(this.filtro.data, usuario, 'weeks');
            } else {
              this.seleccionarSemana(this.filtro.data);
            }
            break;
        }
      });
    } else {
      setTimeout(() => {
        this.onFiltro();
      }, 500);
    }
  }

  async seleccionarFecha() {
    const data = this.filtro.data;
    const modal = await this.modalController.create({
      component: CalendarioPage,
      componentProps: {
        antes: true,
        fecha: data
      }
    });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        this.filtro.data = data.fecha;
        this.onFiltro();
      }
    });

    await modal.present();
  }

  seleccionarAnno(valor: 1 | -1 | Date) {
    const fechaSeleccionada = valor instanceof Date ? valor : moment(this.filtro.data).add(valor, 'years').toDate();
    this.adelante = moment(new Date()).diff(fechaSeleccionada, 'year') !== 0;
    this.atras = moment(fechaSeleccionada).get('year') !== 1;
    this.onFiltro();
  }

  seleccionarSemana(valor: 1 | -1 | Date) {
    const fechaSeleccionada = valor instanceof Date ? valor : moment(this.filtro.data).add(valor, 'weeks').toDate();
    this.adelante = moment(new Date()).diff(fechaSeleccionada, 'week') !== 0;
    const diaInicio = moment(fechaSeleccionada).startOf('week').add(1, 'days').toDate();
    const diaFin = moment(fechaSeleccionada).endOf('week').add(1, 'days').toDate();
    const fecha = moment(diaInicio);
    const titulo = `${fecha.locale('es').format('DD MMM YYYY')} ${moment(diaFin).locale('es').format('[-] DD MMM YYYY')}`;
    this.filtro.data = fechaSeleccionada;
    this.filtro.titulo = titulo.toLocaleUpperCase();
    this.onFiltro();
  }

  seleccionarMes(valor: 1 | -1 | Date) {
    const fechaSeleccionada = valor instanceof Date ? valor :
      moment(this.filtro.data).add(valor, 'months').toDate();
    const ahora = moment(new Date());
    this.adelante = ahora.diff(fechaSeleccionada, 'month') !== 0;
    const titulo = moment(fechaSeleccionada).locale("es").format("MMMM YYYY").toLocaleUpperCase();;
    this.filtro.data = fechaSeleccionada;
    this.filtro.titulo = titulo.toLocaleUpperCase();
    if (!this.filtro.items) {
      this.filtro.items = [];
      const mesInicio = ahora.add(-1, "years");
      let mesIndex = moment(fechaSeleccionada);
      while (mesIndex.isSameOrAfter(mesInicio)) {
        const titulo = mesIndex.locale("es").format("MMMM YYYY").toLocaleUpperCase();
        this.filtro.items.push({ fecha: mesIndex.toDate(), titulo: titulo });
        mesIndex = mesIndex.add(-1, "month");
      }
    }

    if (valor instanceof Date) {
      this.onFiltro();
    }
  }

  async updateReporte(fecha: Date, usuario: UsuarioOptions, filtro: moment.unitOfTime.StartOf) {
    const loading = await this.loadingController.create({
      message: 'Procesando el reporte...',
      duration: 20000
    });

    loading.present();
    const momentFecha = moment(fecha);
    const fechaInicio = momentFecha.startOf(filtro).toDate();
    let fechaFin = momentFecha.endOf(filtro).toDate();
    fechaFin = moment(fechaFin).isAfter(new Date()) ? new Date() : fechaFin;
    const semanaUsuario: TotalOptions[] = [];
    let fechaIndex = fechaInicio;
    while (moment(fechaIndex).isSameOrBefore(fechaFin)) {
      const totalDia = await this.updateReporteDia(fechaIndex, usuario);
      semanaUsuario.push(totalDia);
      fechaIndex = moment(fechaIndex).add(1, 'days').toDate();
    }

    let canceladoSemana = 0;
    let cantidadSemana = 0;
    let pendienteSemana = 0;
    let totalSemana = 0;
    semanaUsuario.forEach(dia => {
      canceladoSemana += dia.cancelados;
      cantidadSemana += dia.citas;
      pendienteSemana += dia.pendientes;
      totalSemana += dia.total;
    });

    const totalData: TotalOptions = {
      actualizacion: new Date(),
      cancelados: canceladoSemana,
      citas: cantidadSemana,
      id: '',
      pendientes: pendienteSemana,
      total: totalSemana,
      usuario: usuario
    };
    this.updateReporteUsuarios(totalData);
    loading.dismiss();
  }

  private updateReporteDia(fecha: Date, usuario: UsuarioOptions) {
    const fechaInicio = moment(fecha).startOf('day').toDate().getTime().toString();
    return new Promise<TotalOptions>(resolve => {
      this.reservaService.disponibilidadDia(usuario.id, fechaInicio).subscribe(totalDia => {
        if (!totalDia) {
          totalDia = {
            actualizacion: new Date(),
            cancelados: 0,
            citas: 0,
            id: '',
            pendientes: 0,
            total: 0,
            usuario: usuario
          };
        }

        resolve(totalDia);
      });
    });
  }

  updateReporteUsuarios(totalData: TotalOptions) {
    const index = this.totalesUsuarios.findIndex(totalUsuario => totalUsuario.usuario.id === totalData.usuario.id);
    if (index > -1) {
      this.totalesUsuarios.splice(index, 1, totalData);
    } else {
      this.totalesUsuarios.push(totalData);
    }

    this.total += Number(totalData.total);
    this.cantidad += Number(totalData.citas);
  }

  private updateUsuario() {
    const usuario = !this.loginService.administrador ? this.loginService.usuario.id : null;
    this.updateUsuarios(usuario);
  }

  private updateUsuarios(idUsuario?: string) {
    this.empresaService.usuarios().subscribe(usuarios => {
      this.usuarios = idUsuario ? usuarios.filter(usuario => usuario.id === idUsuario) : usuarios;
    });
  }

  ver(usuario: string) {
    this.router.navigate(['/tabs/reporte/detalle/'], { queryParams: { usuario: usuario } });
  }

}
