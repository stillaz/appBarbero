import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgendaPageRoutingModule } from './agenda-routing.module';

import { AgendaPage } from './agenda.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CalendarioPageModule } from '../calendario/calendario.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgendaPageRoutingModule,
    CalendarioPageModule,
    PipesModule
  ],
  declarations: [AgendaPage]
})
export class AgendaPageModule { }
