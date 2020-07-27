import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportePage } from './reporte.page';
import { DetalleReporteComponent } from './detalle-reporte/detalle-reporte.component';

const routes: Routes = [
  {
    path: '',
    component: ReportePage
  }, {
    path: 'detalle',
    component: DetalleReporteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportePageRoutingModule {}
