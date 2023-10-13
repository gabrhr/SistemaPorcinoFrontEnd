import { toast } from 'react-toastify';

export function successMessage (message) {
    toast.success(message || "Se ha realizado satisfactoriamente");
}

export function infoMessage (message) {
    toast.info(message,{
        autoClose: 5000
    });
}

export function errorMessage (message) {
    toast.error(message || "El servicio ha encontrado un error");
}