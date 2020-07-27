import { Pipe, PipeTransform } from '@angular/core';
import { ReservaOptions } from '../interfaces/reserva-options';

@Pipe({
  name: 'disponibilidadFilter'
})
export class DisponibilidadFilterPipe implements PipeTransform {

  transform(items: any[], terms: string): any[] {
    if (!items) return [];
    if (!terms) return items;
    terms = terms.toLowerCase();
    const itemsList = items.map(i => i.disponibilidad);

    const itemsL = itemsList;
    itemsL.forEach((item, index) => {
      item.forEach((reserva: ReservaOptions) => {
        if (reserva.estado.toLowerCase() !== terms) {
          let nitem = item.indexOf(reserva);
          itemsList[index].splice(nitem, 1);
        }
      });
    });

    return items.filter(it => {
      return it.disponibilidad.some((reserva: ReservaOptions) => {
        return reserva.estado.toLowerCase() === terms;
      });
    });
  }

}
