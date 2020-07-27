import { UsuarioOptions } from './usuario-options';
import { PaqueteOptions } from './paquete-options';
import { ServicioOptions } from './servicio-options';

export interface ReservaOptions {
    actualiza: string,
    cliente: UsuarioOptions,
    estado: string,
    evento?: string,
    fechaActualizacion: Date,
    fechaInicio: any,
    fechaFin: any,
    id: string,
    idcarrito?: number,
    leido?: boolean,
    pago: number,
    paquete?: PaqueteOptions,
    servicio: ServicioOptions[],
    usuario: UsuarioOptions
}
