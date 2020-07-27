import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonaPage } from './persona.page';
import { DetallePersonaComponent } from './detalle-persona/detalle-persona.component';

const routes: Routes = [
  {
    path: '',
    component: PersonaPage
  }, {
    path: 'registro',
    component: DetallePersonaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonaPageRoutingModule {}
