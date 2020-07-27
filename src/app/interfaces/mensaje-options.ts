export class MensajeOptions {
    fecha: string
    data: {
        id: string,
        modo: string,
        info: string
    }
    mensaje: {
        body: string,
        title: string
    }
    token?: string
}