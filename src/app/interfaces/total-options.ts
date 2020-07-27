import { UsuarioOptions } from './usuario-options';

export interface TotalOptions {
    actualizacion: Date,
    citas: number,
    cancelados: number,
    id: string,
    pendientes: number,
    total: number,
    usuario: UsuarioOptions
}
