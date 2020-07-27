import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendientePage } from './pendiente.page';

const routes: Routes = [
  {
    path: '',
    component: PendientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendientePageRoutingModule {}
