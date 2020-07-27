import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { MenuComponent } from './menu/menu.component';
import { PersonaPageModule } from '../persona/persona.module';
import { NotificacionPageModule } from '../notificacion/notificacion.module';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    PersonaPageModule,
    PipesModule,
    NotificacionPageModule,
  ],
  declarations: [TabsPage, MenuComponent]
})
export class TabsPageModule {}
