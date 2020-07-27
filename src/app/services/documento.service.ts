import { Injectable } from '@angular/core';
import { DocumentoMap } from '../config-documento';
import moment from 'moment';
import { Documento } from '../interfaces/documento';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  constructor() { }

  mapDocumentoPDF417(data: string) {
    const dataDocumento = {} as Documento;
    if (data.length >= 170) {
      let item: string;
      const keys = Object.keys(DocumentoMap);
      keys.forEach(key => {
        if (key.startsWith('fecha')) {
          item = data.substring(DocumentoMap[key].inicio, DocumentoMap[key].fin);
          dataDocumento[key] = moment(item, DocumentoMap[key].formato).toDate().toISOString();
        } else if (DocumentoMap[key].transformacion) {
          item = data.substring(DocumentoMap[key].inicio, DocumentoMap[key].fin);
          dataDocumento[key] = DocumentoMap[key].transformacion[item];
        } else {
          item = data.substring(DocumentoMap[key].inicio, DocumentoMap[key].fin);
          dataDocumento[key] = item.replace(/\0/g, '').replace(' ', '');
        }
      });
    }

    dataDocumento.nombre = dataDocumento.nombre_1.concat(` ${dataDocumento.nombre_2}`).trim()
      .concat(' ').concat(dataDocumento.apellido_1.concat(` ${dataDocumento.apellido_2}`));

    return dataDocumento;
  }
}
