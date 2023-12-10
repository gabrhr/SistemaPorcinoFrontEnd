import moment from 'moment';
import { corralEstado, corralTipo, servicioEstado } from './defaultValues';

export const  generateRandomString = (num) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= '';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
}

export const cortarTexto = (texto = "", limit = 101) => {
    if(texto && texto.length > 0){
        if(texto.length <= limit){
            return texto
        }
        const textoCortado = texto.substring(0,limit)
        return textoCortado.concat("...")
    }   
    return ""
}

export function formatNameCapitals(names) {
    let newNames = '';
    let last = ' ';
    
    if(!names) return null;
    names = names.toLowerCase();

    for (let i = 0; i < names.length; i++) {
        if(last === ' ' || last === '(' || last === ')' || last === ',' || last === '.' || last === ';' || last === '/')
            newNames += names.charAt(i).toUpperCase();
        else newNames += names.charAt(i);

        last = names.charAt(i);
    }

    return newNames;
}

export function formatDate(date, format="DD/MM/YYYY"){
    if(date){
        return moment(date).format(format)
    }
    return ""
}

export function differenciaEntreFechas(dateStart, tipo="days", dateFin = new Date()){
    const text = tipo ==="month"?"meses": "días"
    if(dateStart){
        const fecha1 = moment(dateStart);
        const fecha2 = moment(dateFin);
        return `${fecha2.diff(fecha1, tipo)} ${text}`
    }
    return "-"
}

// Cerda

export function getEstadoCerdaNombre(nombre){
    if(nombre && nombre === "Vacia"){
        return "Vacía"
    } 
    return nombre || ""
}


// Servicio estados

export function getEstadoServicioNombre(nombre){
    if(nombre && nombre === servicioEstado.finalizado){
        return "Finalizado con Parto"
    } else if(nombre && nombre === servicioEstado.gestacion){
        return "Gestación"
    }
    return nombre || ""
}

export function getEstadoMaternidadNombre(nombre){
    if(nombre && nombre === servicioEstado.gestacion){
        return "Gestación"
    }
    return nombre || ""
}

export function getPorcentajeFormato(val){
    if(val !== null && val !== undefined && typeof val === "number"){
        if(val > 0 && val < 1){
            return val.toFixed(1)
        }
        return val.toFixed(0)
    }
    return 0
}

export function getEstadoCorral(nombre){
    if(nombre){
        const nombreLower = nombre.toLowerCase()
        return corralEstado[nombreLower] || "-"
    }
    return nombre || ""
}

export function getTipoCorral(nombre){
    if(nombre){
        return corralTipo[nombre] || "-"
    }
    return nombre || ""
}