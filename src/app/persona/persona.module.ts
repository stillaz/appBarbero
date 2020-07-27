import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonaPageRoutingModule } from './persona-routing.module';

import { PersonaPage } from './persona.page';
import { DetallePersonaComponent } from './detalle-persona/detalle-persona.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonaPageRoutingModule,
    PipesModule,
    ReactiveFormsModule,
  ],
  declarations: [PersonaPage, DetallePersonaComponent],
  entryComponents: [DetallePersonaComponent]
})
export class PersonaPageModule {}
