import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import { FotoPageModule } from '../foto/foto.module';

@NgModule({
  imports: [
    CommonModule,
    FotoPageModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
