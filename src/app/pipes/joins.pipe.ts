import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joins'
})
export class JoinsPipe implements PipeTransform {

  transform(items: any[]): any {
    if (items && items.length > 0) {
      return items.map(item => item.nombre).join(' - ');
    }
    return null;
  }

}
