import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReservaPageRoutingModule } from './reserva-routing.module';

import { ReservaPage } from './reserva.page';
import { DetalleClienteComponent } from './detalle-cliente/detalle-cliente.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ReservaPageRoutingModule
  ],
  declarations: [ReservaPage, DetalleClienteComponent],
  entryComponents: [DetalleClienteComponent]
})
export class ReservaPageModule {}
