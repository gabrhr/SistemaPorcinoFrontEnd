import moment from 'moment';

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

export function formatDate(date, format="DD MMM YYYY"){
    if(date){
        return moment(date).format(format)
    }
    return ""
}

// Cerda

export function getEstadoCerdaNombre(nombre){
    if(nombre && nombre === "Vacia"){
        return "Vacia"
    } 
    return nombre || ""
}