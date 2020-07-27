export const DocumentoMap = {
    documento: { inicio: 48, fin: 58 },
    apellido_1: { inicio: 58, fin: 81 },
    apellido_2: { inicio: 81, fin: 104 },
    nombre_1: { inicio: 104, fin: 127 },
    nombre_2: { inicio: 127, fin: 150 },
    sexo: { inicio: 151, fin: 152, transformacion: { F: 'Femenino', M: 'Masculino' } },
    fecha_nacimiento: { inicio: 152, fin: 160, formato: 'YYYYMMDD' },
    rh: { inicio: 166, fin: 169 }
};