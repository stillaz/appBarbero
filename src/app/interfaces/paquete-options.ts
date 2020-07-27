import { ServicioOptions } from './servicio-options';
import { GrupoOptions } from './grupo-options';

export interface PaqueteOptions {
    activo: boolean
    descripcion: string,
    id: string,
    imagen: string,
    grupo: GrupoOptions,
    nombre: string,
    valor: number
    servicios: ServicioOptions[]
}
