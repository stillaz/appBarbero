import { Component, OnInit } from '@angular/core';
import { PersonaService } from '../services/persona.service';
import { PopoverController } from '@ionic/angular';
import { NotificacionPage } from '../notificacion/notificacion.page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  personas: number;
  constructor(private personaService: PersonaService, private popoverController: PopoverController) { }

  ngOnInit() {
    this.updatePersonas();
  }

  async notificaciones(event: CustomEvent) {
    const popover = await this.popoverController.create({
      component: NotificacionPage,
      event,
      translucent: true
    });

    popover.present();
  }

  private updatePersonas() {
    this.personaService.personas(new Date()).subscribe(personas => {
      this.personas = personas.filter(persona => !persona.salida).length;
    });
  }

}
