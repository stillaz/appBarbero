import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendientePageRoutingModule } from './pendiente-routing.module';

import { PendientePage } from './pendiente.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { DetalleCitaComponent } from './detalle-cita/detalle-cita.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendientePageRoutingModule,
    PipesModule
  ],
  declarations: [PendientePage, DetalleCitaComponent],
  entryComponents: [DetalleCitaComponent]
})
export class PendientePageModule {}
