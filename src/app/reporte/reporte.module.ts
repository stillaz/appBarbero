import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportePageRoutingModule } from './reporte-routing.module';

import { ReportePage } from './reporte.page';
import { CalendarioPageModule } from '../calendario/calendario.module';
import { DetalleReporteComponent } from './detalle-reporte/detalle-reporte.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportePageRoutingModule,
    CalendarioPageModule
  ],
  declarations: [ReportePage, DetalleReporteComponent]
})
export class ReportePageModule {}
