import { PerfilOptions } from "./perfil-options";
import { ConfiguracionOptions } from './configuracion-options';

export interface UsuarioOptions {
    activo: boolean,
    actualizacion ?: Date,
    configuracion: ConfiguracionOptions,
    correoelectronico?: string,
    email: string,
    fechaRegistro?: Date,
    id: string,
    idempresa: string,
    imagen: string,
    nombre: string,
    pendientes: number,
    perfiles: PerfilOptions[],
    telefono: string,
    token: string
}
