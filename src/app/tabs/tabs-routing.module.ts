import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'agenda',
        loadChildren: () => import('../agenda/agenda.module').then(m => m.AgendaPageModule),
      }, {
        path: 'pendiente',
        loadChildren: () => import('../pendiente/pendiente.module').then(m => m.PendientePageModule),
      }, {
        path: 'personas',
        loadChildren: () => import('../persona/persona.module').then(m => m.PersonaPageModule),
      }, {
        path: 'reporte',
        loadChildren: () => import('../reporte/reporte.module').then(m => m.ReportePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
