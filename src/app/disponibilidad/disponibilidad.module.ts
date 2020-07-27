import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisponibilidadPageRoutingModule } from './disponibilidad-routing.module';

import { DisponibilidadPage } from './disponibilidad.page';
import { DetalleNoDisponibleComponent } from './detalle-no-disponible/detalle-no-disponible.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisponibilidadPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [DisponibilidadPage, DetalleNoDisponibleComponent],
  entryComponents: [DetalleNoDisponibleComponent]
})
export class DisponibilidadPageModule {}
